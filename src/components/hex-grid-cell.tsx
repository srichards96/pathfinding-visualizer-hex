import { MouseEvent } from "react";
import {
  HexGridWideRowType,
  HexGridWideRowTypes,
} from "../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "../types/hex-grid-cell-type";
import { HexGridCellSizingData } from "../types/hex-grid-cell-sizing-data";

type Props = {
  cell: HexGridCellType;
  wideRows: HexGridWideRowType;
  hexCellSizingData: HexGridCellSizingData;
  onMouseDown: (e: MouseEvent, cell: HexGridCellType) => void;
  onMouseEnter: (e: MouseEvent, cell: HexGridCellType) => void;
  isStart: boolean;
  isTarget: boolean;
};

export function HexGridCell({
  cell,
  wideRows,
  hexCellSizingData,
  onMouseDown,
  onMouseEnter,
  isStart,
  isTarget,
}: Props) {
  // Determine whether row is a "wide" row
  // Hex grid rows alternate between n - 1 and n items wide
  const isWideRow =
    wideRows === HexGridWideRowTypes.Even ? cell.y % 2 === 1 : cell.y % 2 === 0;

  const { sideLength, width, height, spacing } = hexCellSizingData;

  const left =
    cell.x * (width + sideLength + 2 * spacing) +
    (!isWideRow ? 1.5 * sideLength + spacing : 0); // Non-wide rows need extra padding on left

  const top = cell.y * (0.5 * height + 0.5 * spacing);

  return (
    <div
      className="hex-grid-cell relative"
      data-visited={cell.visited}
      data-on-path={cell.onPath}
      style={{
        width,
        height,
        position: "absolute",
        transform: `translate3D(${left}px, ${top}px, 0)`,
      }}
      onMouseDown={(e) => onMouseDown(e, cell)}
      onMouseEnter={(e) => onMouseEnter(e, cell)}
    >
      {(isStart || isTarget) && (
        <span className="absolute left-1/2 top-1/2 -translate-1/2 z-10">
          {isStart && "start"}
          {isTarget && "target"}
        </span>
      )}
    </div>
  );
}
