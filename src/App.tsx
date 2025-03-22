import { makeHexGrid } from "./util/hex/make-hex-grid";
import { HexGridWideRowTypes } from "./constants/hex/hex-grid-wide-row-types";
import { breadthFirstSearch } from "./algorithms/breadth-first-search";
import { useImmer } from "use-immer";
import { HexGridPosition } from "./types/hex-grid-position";
import { mouseButtonsHeld } from "./util/mouse-buttons-held";
import { MouseButtonFlags } from "./constants/mouse-buttons";
import { HexGridCellType } from "./types/hex-grid-cell-type";
import { HexGrid } from "./components/hex-grid";
import { useCallback, useState, MouseEvent, useMemo } from "react";
import { calculateHexCellSizingData } from "./util/hex/calculate-hex-cell-sizing-data";

const rows = 25;
const cols = 8;
const wideRows = HexGridWideRowTypes.Even;

function App() {
  const [grid, setGrid] = useImmer(() => makeHexGrid({ rows, cols, wideRows }));
  const [startPosition, setStartPosition] = useState<HexGridPosition>();
  const [targetPosition, setTargetPosition] = useState<HexGridPosition>();

  // TODO: make variable via a form...
  const [sideLength] = useState(30);
  const [spacing] = useState(2);

  const hexCellSizingData = useMemo(() => {
    return calculateHexCellSizingData({
      sideLength,
      spacing,
    });
  }, [sideLength, spacing]);

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

  // TODO: make this not suck...
  function testBfs() {
    const animationSpeed = 100;

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
      }, i * animationSpeed);
    }

    if (cellsOnPath !== undefined) {
      const timeoutOffset = cellsTraversed.length * animationSpeed;

      for (let i = 0; i < cellsOnPath.length; i++) {
        const { x: stepX, y: stepY } = cellsOnPath[i];

        setTimeout(() => {
          setGrid((draft) => {
            draft[stepY][stepX].onPath = true;
            return draft;
          });
        }, timeoutOffset + i * animationSpeed);
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
      </div>

      <HexGrid
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
