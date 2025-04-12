import { makeHexGrid } from "./util/hex/make-hex-grid";
import { HexGridWideRowTypes } from "./constants/hex/hex-grid-wide-row-types";
import { useImmer } from "use-immer";
import { HexGridPosition } from "./types/hex-grid-position";
import { mouseButtonsHeld } from "./util/mouse-buttons-held";
import { MouseButtonFlags } from "./constants/mouse-buttons";
import { HexGridCellType } from "./types/hex-grid-cell-type";
import { HexGrid } from "./components/hex-grid";
import {
  useCallback,
  useState,
  MouseEvent,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { calculateHexCellSizingData } from "./util/hex/calculate-hex-cell-sizing-data";
import { resizeHexGridToFitContainer } from "./util/hex/resize-hex-grid-to-fit-container";
import {
  OptionsForm,
  PathfindingVisualerFormValues,
} from "./components/options-form";
import { calculateHexGridPathfind } from "./util/hex/calculate-hex-grid-pathfind";
import { HexGridPathfindingResult } from "./types/hex-grid-pathfinding-result";
import { produce } from "immer";

const rows = 25;
const cols = 8;
const wideRows = HexGridWideRowTypes.Even;

function App() {
  // Whether pathfind is currently being animated
  const [isRunning, setIsRunning] = useState(false);
  // Whether pathfind has been run (and not been reset)
  const [hasRun, setHasRun] = useState(false);

  const [grid, setGrid] = useImmer(() => makeHexGrid({ rows, cols, wideRows }));
  const [start, setStart] = useState<HexGridPosition>();
  const [target, setTarget] = useState<HexGridPosition>();

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [formValues, setFormValues] = useState<PathfindingVisualerFormValues>({
    cellSize: 30,
    cellSpacing: 2,
    animationSpeed: 200,
    cellPaintbrush: {
      type: "wall",
    },
    algorithm: "breadthFirstSearch",
  });

  const hexCellSizingData = useMemo(() => {
    return calculateHexCellSizingData({
      sideLength: formValues.cellSize,
      spacing: formValues.cellSpacing,
    });
  }, [formValues.cellSize, formValues.cellSpacing]);

  // On load, and when cell sizing changes, resize grid to fit available space...
  useEffect(() => {
    const gridContainerElement = gridContainerRef.current;

    if (gridContainerElement == null) {
      return;
    }

    setGrid((draft) =>
      resizeHexGridToFitContainer({
        grid: draft,
        element: gridContainerElement,
        hexCellSizingData,
        wideRows,
      })
    );
  }, [hexCellSizingData, setGrid]);

  // On window resize, and when cell sizing changes, resize grid to fit available space...
  useEffect(() => {
    function onResize() {
      const gridContainerElement = gridContainerRef.current;

      if (gridContainerElement !== null) {
        setGrid((draft) =>
          resizeHexGridToFitContainer({
            grid: draft,
            element: gridContainerElement,
            hexCellSizingData,
            wideRows,
          })
        );
      }
    }

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [hexCellSizingData, setGrid]);

  const clearPathfind = useCallback(() => {
    setGrid((draft) => {
      for (const row of draft) {
        for (const cell of row) {
          cell.visited = false;
          cell.onPath = false;
        }
      }
    });

    setHasRun(false);
  }, [setGrid]);

  // Applies pathfind to grid immediately
  const applyPathfind = useCallback(
    ({ cellsTraversed, cellsOnPath }: HexGridPathfindingResult) => {
      setHasRun(true);

      setGrid((draft) => {
        for (const { x, y } of cellsTraversed) {
          draft[y][x].visited = true;
        }
      });

      setGrid((draft) => {
        if (cellsOnPath === undefined) {
          return;
        }

        for (const { x, y } of cellsOnPath) {
          draft[y][x].onPath = true;
        }
      });
    },
    [setGrid]
  );

  // Applies pathfind to grid over time, with each step having a delay
  function applyPathfindWithAnimation({
    cellsTraversed,
    cellsOnPath,
  }: HexGridPathfindingResult) {
    setIsRunning(true);
    setHasRun(true);

    const hasPath = cellsOnPath !== undefined;

    for (let i = 0; i < cellsTraversed.length; i++) {
      const isLast = i === cellsTraversed.length - 1;

      const { x: stepX, y: stepY } = cellsTraversed[i];

      setTimeout(() => {
        setGrid((draft) => {
          draft[stepY][stepX].visited = true;
          return draft;
        });

        if (isLast && !hasPath) {
          setIsRunning(false);
        }
      }, i * formValues.animationSpeed);
    }

    if (hasPath) {
      const timeoutOffset = cellsTraversed.length * formValues.animationSpeed;

      for (let i = 0; i < cellsOnPath.length; i++) {
        const isLast = i === cellsOnPath.length - 1;

        const { x: stepX, y: stepY } = cellsOnPath[i];

        setTimeout(() => {
          setGrid((draft) => {
            draft[stepY][stepX].onPath = true;
            return draft;
          });

          if (isLast) {
            setIsRunning(false);
          }
        }, timeoutOffset + i * formValues.animationSpeed);
      }
    }
  }

  // Handler for both cell MouseDown and MouseEnter events...
  const onCellMouseEvent = useCallback(
    (e: MouseEvent, cell: HexGridCellType) => {
      if (isRunning) {
        return;
      }

      let nextGrid = grid;
      let nextStart = start;
      let nextTarget = target;

      const { x, y } = cell;
      if (mouseButtonsHeld(e, MouseButtonFlags.left)) {
        switch (formValues.cellPaintbrush.type) {
          case "start":
            nextStart = { x, y };
            break;
          case "target":
            nextTarget = { x, y };
            break;
          case "empty":
            nextGrid = produce(grid, (draft) => {
              draft[y][x].weight = 1;
              draft[y][x].wall = false;
            });
            break;
          case "wall":
            nextGrid = produce(grid, (draft) => {
              draft[y][x].weight = 1;
              draft[y][x].wall = true;
            });
            break;
          case "weighted": {
            const weight = formValues.cellPaintbrush.weight;
            nextGrid = produce(grid, (draft) => {
              draft[y][x].weight = weight;
              draft[y][x].wall = false;
            });
            break;
          }
        }
      } else if (mouseButtonsHeld(e, MouseButtonFlags.right)) {
        // Clear start position if selected
        if (x === start?.x && y === start.y) {
          nextStart = undefined;
        }
        // Clear target position if selected
        if (x === target?.x && y === target.y) {
          nextTarget = undefined;
        }
        // Clear weight/wall state
        nextGrid = produce(grid, (draft) => {
          draft[y][x].weight = 1;
          draft[y][x].wall = false;
        });
      }

      setStart(nextStart);
      setTarget(nextTarget);
      setGrid(nextGrid);

      if (hasRun) {
        const pathfind = calculateHexGridPathfind({
          grid,
          start,
          target,
          algorithmName: formValues.algorithm,
          wideRows,
        });
        clearPathfind();

        if (pathfind !== undefined) {
          applyPathfind(pathfind);
        }
      }
    },
    [
      setGrid,
      grid,
      start,
      target,
      formValues,
      isRunning,
      hasRun,
      clearPathfind,
      applyPathfind,
    ]
  );

  function onPathfindButtonClicked() {
    if (isRunning) {
      return;
    }

    const pathfindResult = calculateHexGridPathfind({
      grid,
      start: start,
      target: target,
      algorithmName: formValues.algorithm,
      wideRows,
    });

    if (pathfindResult !== undefined) {
      clearPathfind();
      applyPathfindWithAnimation(pathfindResult);
    }
  }

  return (
    <main className="flex h-screen relative">
      <div className="flex-shrink-0 w-[300px] bg-gray-800 text-white p-2 space-y-4">
        <h1 className="text-2xl font-bold">Pathfinding Visualizer Hex</h1>

        <div className="flex gap-2 justify-between">
          <button
            className="border rounded-sm px-4 py-2"
            disabled={isRunning}
            onClick={onPathfindButtonClicked}
          >
            Animate Pathfind
          </button>

          {hasRun && !isRunning && (
            <button
              className="border rounded-sm px-4 py-2"
              disabled={isRunning}
              onClick={clearPathfind}
            >
              Reset
            </button>
          )}
        </div>

        <OptionsForm defaultValues={formValues} onSubmit={setFormValues} />
      </div>

      <HexGrid
        ref={gridContainerRef}
        grid={grid}
        wideRows={wideRows}
        hexCellSizingData={hexCellSizingData}
        startPosition={start}
        targetPosition={target}
        onCellMouseDown={onCellMouseEvent}
        onCellMouseEnter={onCellMouseEvent}
      />
    </main>
  );
}

export default App;
