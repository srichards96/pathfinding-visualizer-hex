import { makeHexGrid } from "./util/hex/make-hex-grid";
import { HexGridWideRowTypes } from "./constants/hex/hex-grid-wide-row-types";
import { breadthFirstSearch } from "./algorithms/breadth-first-search";
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

const rows = 25;
const cols = 8;
const wideRows = HexGridWideRowTypes.Even;

function App() {
  const [grid, setGrid] = useImmer(() => makeHexGrid({ rows, cols, wideRows }));
  const [startPosition, setStartPosition] = useState<HexGridPosition>();
  const [targetPosition, setTargetPosition] = useState<HexGridPosition>();

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [formValues, setFormValues] = useState<PathfindingVisualerFormValues>({
    cellSize: 30,
    cellSpacing: 2,
    animationSpeed: 200,
  });

  const hexCellSizingData = useMemo(() => {
    return calculateHexCellSizingData({
      sideLength: formValues.cellSize,
      spacing: formValues.cellSpacing,
    });
  }, [formValues.cellSize, formValues.cellSpacing]);

  // Handler for both cell MouseDown and MouseEnter events...
  const onCellMouseEvent = useCallback(
    (e: MouseEvent, cell: HexGridCellType) => {
      const { x, y } = cell;
      if (mouseButtonsHeld(e, MouseButtonFlags.left)) {
        // TODO: make this action configurable - set start / target / n weight, etc...
        setStartPosition({ x, y });
      } else if (mouseButtonsHeld(e, MouseButtonFlags.right)) {
        // TODO: after making left click action configurable, make this always clear the cell...
        setTargetPosition({ x, y });
      }
    },
    []
  );

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

  // TODO: make this not suck...
  function testBfs() {
    if (startPosition === undefined || targetPosition === undefined) {
      return;
    }

    // Reset previous pathfind state/animations...
    setGrid((draft) => {
      for (const row of draft) {
        for (const cell of row) {
          cell.visited = false;
          cell.onPath = false;
        }
      }
      return draft;
    });

    const { cellsTraversed, cellsOnPath } = breadthFirstSearch({
      grid,
      start: grid[startPosition.y][startPosition.x],
      target: grid[targetPosition.y][targetPosition.x],
      wideRows,
    });

    for (let i = 0; i < cellsTraversed.length; i++) {
      const { x: stepX, y: stepY } = cellsTraversed[i];

      setTimeout(() => {
        setGrid((draft) => {
          draft[stepY][stepX].visited = true;
          return draft;
        });
      }, i * formValues.animationSpeed);
    }

    if (cellsOnPath !== undefined) {
      const timeoutOffset = cellsTraversed.length * formValues.animationSpeed;

      for (let i = 0; i < cellsOnPath.length; i++) {
        const { x: stepX, y: stepY } = cellsOnPath[i];

        setTimeout(() => {
          setGrid((draft) => {
            draft[stepY][stepX].onPath = true;
            return draft;
          });
        }, timeoutOffset + i * formValues.animationSpeed);
      }
    }
  }

  return (
    <main className="flex h-screen relative">
      <div className="flex-shrink-0 w-[300px] bg-gray-800 text-white p-2 space-y-4">
        <h1 className="text-2xl font-bold">Pathfinding Visualizer Hex</h1>

        <button className="border rounded-sm px-4 py-2" onClick={testBfs}>
          Test BFS
        </button>

        <OptionsForm defaultValues={formValues} onSubmit={setFormValues} />
      </div>

      <HexGrid
        ref={gridContainerRef}
        grid={grid}
        wideRows={wideRows}
        hexCellSizingData={hexCellSizingData}
        startPosition={startPosition}
        targetPosition={targetPosition}
        onCellMouseDown={onCellMouseEvent}
        onCellMouseEnter={onCellMouseEvent}
      />
    </main>
  );
}

export default App;
