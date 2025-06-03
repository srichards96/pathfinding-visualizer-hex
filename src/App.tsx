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
import { Menu, X } from "lucide-react";

const rows = 25;
const cols = 8;
const wideRows = HexGridWideRowTypes.Even;
const animateSpeed = 1000; // How long css animations are when animating pathfind

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Whether pathfind is currently being animated
  const [isRunningAnimation, setIsRunningAnimation] = useState(false);
  // Whether pathfind has been run (and not been reset)
  const [hasRun, setHasRun] = useState(false);

  const [grid, setGrid] = useImmer(() => makeHexGrid({ rows, cols, wideRows }));
  const [start, setStart] = useState<HexGridPosition>();
  const [target, setTarget] = useState<HexGridPosition>();

  const [timeoutHandles, setTimeoutHandles] = useState<number[]>([]);

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
    for (const handle of timeoutHandles) {
      clearTimeout(handle);
    }

    setGrid((draft) => {
      for (const row of draft) {
        for (const cell of row) {
          cell.visited = false;
          cell.onPath = false;
        }
      }
    });

    setHasRun(false);
    setIsRunningAnimation(false);
    setTimeoutHandles([]);
  }, [timeoutHandles, setGrid]);

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
    setIsRunningAnimation(true);
    setHasRun(true);

    const handles = [];

    // How long it takes for all cellsTravered timeouts to resolve
    const pathTimeoutOffset = cellsTraversed.length * formValues.animationSpeed;
    // How long it takes for all timeouts to resolve
    const endTimeoutOffset =
      (cellsTraversed.length + (cellsOnPath?.length ?? 0)) *
      formValues.animationSpeed;

    for (let i = 0; i < cellsTraversed.length; i++) {
      const { x: stepX, y: stepY } = cellsTraversed[i];

      const handle = setTimeout(() => {
        setGrid((draft) => {
          draft[stepY][stepX].visited = true;
          return draft;
        });
      }, i * formValues.animationSpeed);
      handles.push(handle);
    }

    if (cellsOnPath !== undefined) {
      for (let i = 0; i < cellsOnPath.length; i++) {
        const { x: stepX, y: stepY } = cellsOnPath[i];

        const handle = setTimeout(() => {
          setGrid((draft) => {
            draft[stepY][stepX].onPath = true;
            return draft;
          });
        }, pathTimeoutOffset + i * formValues.animationSpeed);
        handles.push(handle);
      }
    }

    // Allow time for last cell animation...
    const handle = setTimeout(() => {
      setIsRunningAnimation(false);
    }, endTimeoutOffset + animateSpeed);
    handles.push(handle);

    setTimeoutHandles(handles);
  }

  // Handler for both cell MouseDown and MouseEnter events...
  const onCellMouseEvent = useCallback(
    (e: MouseEvent, cell: HexGridCellType) => {
      if (isRunningAnimation) {
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
          grid: nextGrid,
          start: nextStart,
          target: nextTarget,
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
      isRunningAnimation,
      hasRun,
      clearPathfind,
      applyPathfind,
    ]
  );

  function onAnimatePathfindButtonClicked() {
    if (isRunningAnimation) {
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
  function onSkipPathfindButtonClicked() {
    clearPathfind();

    const pathfindResult = calculateHexGridPathfind({
      grid,
      start: start,
      target: target,
      algorithmName: formValues.algorithm,
      wideRows,
    });

    if (pathfindResult !== undefined) {
      applyPathfind(pathfindResult);
    }
  }

  return (
    <main className="flex h-screen relative">
      <div
        className="flex-shrink-0 w-full md:w-[300px] overflow-y-auto bg-gray-800 text-white p-4 space-y-4 absolute z-10 inset-y-0 data-[open=false]:left-[-100%] data-[open=false]:opacity-0 data-[open=true]:left-0 data-[open=true]:opacity-100 transition-all md:relative md:!left-0 md:!opacity-100"
        data-open={menuOpen}
      >
        <button
          className="absolute right-2 top-2 p-2 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X />
        </button>
        <div className="space-y-4">
          <h2 className="text-2xl">Controls:</h2>
          <div className="flex gap-2 justify-between">
            {!isRunningAnimation && (
              <button
                className="border rounded-sm px-4 py-2"
                onClick={onAnimatePathfindButtonClicked}
              >
                Animate Pathfind
              </button>
            )}
            {isRunningAnimation && (
              <>
                <button
                  className="border rounded-sm px-4 py-2"
                  onClick={onSkipPathfindButtonClicked}
                >
                  Skip
                </button>
                <button
                  className="border rounded-sm px-4 py-2"
                  onClick={clearPathfind}
                >
                  Cancel
                </button>
              </>
            )}

            {hasRun && !isRunningAnimation && (
              <button
                className="border rounded-sm px-4 py-2"
                disabled={isRunningAnimation}
                onClick={clearPathfind}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <OptionsForm defaultValues={formValues} onSubmit={setFormValues} />
      </div>

      <div className="flex grow flex-col">
        <div className="shrink-0 bg-gray-800 text-white p-2 flex items-center gap-4">
          <button className="md:hidden p-2" onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">
            Pathfinding Visualizer Hex
          </h1>
        </div>

        <HexGrid
          ref={gridContainerRef}
          grid={grid}
          wideRows={wideRows}
          hexCellSizingData={hexCellSizingData}
          startPosition={start}
          targetPosition={target}
          isRunningAnimation={isRunningAnimation}
          animationSpeed={animateSpeed}
          onCellMouseDown={onCellMouseEvent}
          onCellMouseEnter={onCellMouseEvent}
        />
      </div>
    </main>
  );
}

export default App;
