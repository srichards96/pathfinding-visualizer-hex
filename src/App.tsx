import { Fragment, MouseEvent, useCallback, useState } from "react";
import { HexGridCell } from "./components/hex-grid-cell";
import { makeHexGrid } from "./util/hex/make-hex-grid";
import { HexGridWideRowTypes } from "./constants/hex/hex-grid-wide-row-types";
import { breadthFirstSearch } from "./algorithms/breadth-first-search";
import { map2d } from "./util/array/map-2d";
import { useImmer } from "use-immer";
import { HexGridPosition } from "./types/hex-grid-position";
import { mouseButtonsHeld } from "./util/mouse-buttons-held";
import { MouseButtonFlags } from "./constants/mouse-buttons";
import { HexGridCellType } from "./types/hex-grid-cell-type";

const rows = 25;
const cols = 8;
const wideRows = HexGridWideRowTypes.Even;

function App() {
  const [grid, setGrid] = useImmer(() => makeHexGrid({ rows, cols, wideRows }));
  const [start, setStart] = useState<HexGridPosition>();
  const [target, setTarget] = useState<HexGridPosition>();

  // Handler for both cell MouseDown and MouseEnter events...
  const onCellMouseEvent = useCallback(
    (e: MouseEvent, cell: HexGridCellType) => {
      const { x, y } = cell;
      if (mouseButtonsHeld(e, MouseButtonFlags.left)) {
        // TODO: make this action configurable - set start / target / n weight, etc...
        setStart({ x, y });
      } else if (mouseButtonsHeld(e, MouseButtonFlags.right)) {
        // TODO: after making left click action configurable, make this always clear the cell...
        setTarget({ x, y });
      }
    },
    []
  );

  // TODO: make this not suck...
  function testBfs() {
    const animationSpeed = 100;

    if (start === undefined || target === undefined) {
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
      start: grid[start.y][start.x],
      target: grid[target.y][target.x],
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
    <div>
      <button className="border rounded-sm px-4 py-2" onClick={testBfs}>
        Test BFS
      </button>

      <div className="h-screen relative">
        {grid.map((row, rowI) => (
          <Fragment key={rowI}>
            {row.map((cell, colI) => (
              <HexGridCell
                key={`${rowI}-${colI}`}
                cell={cell}
                wideRows={wideRows}
                onMouseDown={onCellMouseEvent}
                onMouseEnter={onCellMouseEvent}
                isStart={cell.x === start?.x && cell.y === start.y}
                isTarget={cell.x === target?.x && cell.y === target.y}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default App;
