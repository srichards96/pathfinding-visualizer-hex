import { Fragment, useState } from "react";
import { HexGridCell } from "./components/hex-grid-cell";
import { makeHexGrid } from "./util/hex/make-hex-grid";
import { HexGridWideRowTypes } from "./constants/hex/hex-grid-wide-row-types";
import { breadthFirstSearch } from "./algorithms/breadth-first-search";
import { map2d } from "./util/array/map-2d";

const rows = 25;
const cols = 8;
const wideRows = HexGridWideRowTypes.Even;

function App() {
  const [grid, setGrid] = useState(() => {
    const grid = makeHexGrid({ rows, cols, wideRows });
    grid[10][4].isStart = true;
    grid[rows - 2][cols - 2].isTarget = true;
    return grid;
  });

  // TODO: make this not suck...
  function testBfs() {
    const animationSpeed = 100;

    const [traversal, path] = breadthFirstSearch({
      grid,
      start: grid[10][4],
      target: grid[rows - 2][cols - 2],
      wideRows,
    });

    for (let i = 0; i < traversal.length; i++) {
      const { x: stepX, y: stepY } = traversal[i];

      setTimeout(() => {
        setGrid((old) =>
          map2d(old, (item, y, x) => {
            if (x === stepX && y === stepY) {
              return { ...item, visited: true };
            }
            return item;
          })
        );
      }, i * animationSpeed);
    }

    if (path !== undefined) {
      const timeoutOffset = traversal.length * animationSpeed;

      for (let i = 0; i < path.length; i++) {
        const { x: stepX, y: stepY } = path[i];

        setTimeout(() => {
          setGrid((old) =>
            map2d(old, (item, y, x) => {
              if (x === stepX && y === stepY) {
                return { ...item, onPath: true };
              }
              return item;
            })
          );
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
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default App;
