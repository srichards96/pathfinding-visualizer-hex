import { Fragment, MouseEvent, Ref } from "react";
import { HexGridWideRowType } from "../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "../types/hex-grid-cell-type";
import { HexGridCell } from "./hex-grid-cell";
import { HexGridPosition } from "../types/hex-grid-position";
import { HexGridCellSizingData } from "../types/hex-grid-cell-sizing-data";

type Props = {
  ref?: Ref<HTMLDivElement>;
  grid: HexGridCellType[][];
  wideRows: HexGridWideRowType;
  hexCellSizingData: HexGridCellSizingData;
  startPosition: HexGridPosition | undefined;
  targetPosition: HexGridPosition | undefined;
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
  onCellMouseDown,
  onCellMouseEnter,
}: Props) {
  return (
    <div
      ref={ref}
      className="flex-grow p-1"
      onContextMenu={(e) => e.preventDefault()}
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
