import { Fragment, MouseEvent, RefObject, useEffect } from "react";
import { HexGridWideRowType } from "../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "../types/hex-grid-cell-type";
import { HexGridCell } from "./hex-grid-cell";
import { HexGridPosition } from "../types/hex-grid-position";
import { HexGridCellSizingData } from "../types/hex-grid-cell-sizing-data";

type Props = {
  ref?: RefObject<HTMLDivElement | null>;
  grid: HexGridCellType[][];
  wideRows: HexGridWideRowType;
  hexCellSizingData: HexGridCellSizingData;
  startPosition: HexGridPosition | undefined;
  targetPosition: HexGridPosition | undefined;
  isRunningAnimation: boolean;
  animationSpeed: number;
  onCellMouseDown: (e: MouseEvent, cell: HexGridCellType) => void;
  onCellMouseEnter: (e: MouseEvent, cell: HexGridCellType) => void;
};

export function HexGrid({
  ref,
  grid,
  wideRows,
  hexCellSizingData,
  startPosition,
  targetPosition,
  isRunningAnimation,
  animationSpeed,
  onCellMouseDown,
  onCellMouseEnter,
}: Props) {
  // Keep css animation speed synced
  useEffect(() => {
    ref?.current?.style.setProperty("--animation-speed", `${animationSpeed}ms`);
  }, [ref, animationSpeed]);

  return (
    <div
      ref={ref}
      className="hex-grid flex-grow p-1"
      onContextMenu={(e) => e.preventDefault()}
      data-animate={isRunningAnimation}
    >
      {grid.map((row, rowI) => (
        <Fragment key={rowI}>
          {row.map((cell, colI) => (
            <HexGridCell
              key={`${rowI}-${colI}`}
              cell={cell}
              wideRows={wideRows}
              hexCellSizingData={hexCellSizingData}
              onMouseDown={onCellMouseDown}
              onMouseEnter={onCellMouseEnter}
              isStart={
                cell.x === startPosition?.x && cell.y === startPosition.y
              }
              isTarget={
                cell.x === targetPosition?.x && cell.y === targetPosition.y
              }
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}
