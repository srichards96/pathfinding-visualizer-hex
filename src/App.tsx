import { Fragment, useEffect, useState } from "react";
import { HexGridCell } from "./components/hex-grid-cell";
import { makeHexGrid } from "./util/make-hex-grid";
import { getRandomNumber } from "./util/get-random-number";

const rows = 25;
const cols = 8;

function App() {
  const [grid] = useState(() => makeHexGrid({ rows, cols }));

  const [highlight, setHighlight] = useState<{ x: number; y: number }>();

  useEffect(() => {
    const handle = setInterval(() => {
      const newHightlight = {
        x: getRandomNumber({ min: 0, max: cols }),
        y: getRandomNumber({ min: 0, max: rows }),
      };
      setHighlight(newHightlight);
      console.log("ran", newHightlight);
    }, 1000);

    return () => clearInterval(handle);
  }, []);

  return (
    <div className="h-screen relative">
      {grid.map((row, rowI) => (
        <Fragment key={rowI}>
          {row.map((cell, colI) => (
            <HexGridCell
              key={`${rowI}-${colI}`}
              cell={cell}
              evenRow={rowI % 2 === 0}
              visited={colI === highlight?.x && rowI === highlight?.y}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

export default App;
