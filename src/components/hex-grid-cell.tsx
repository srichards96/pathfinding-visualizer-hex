import { MouseEvent } from "react";
import {
  HexGridWideRowType,
  HexGridWideRowTypes,
} from "../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "../types/hex-grid-cell-type";

// Some math to calculate various values for sizing cells...
const CELL_SIDE_LENGTH = 30; // Length of each side of hexagon
const CELL_WIDTH = CELL_SIDE_LENGTH * 2; // Width of container...
const CELL_HEIGHT = CELL_WIDTH / (1 + Math.cos(30)); // Height of container (for a equilateral hexagon)
const CELL_SPACING = 4;

type Props = {
  cell: HexGridCellType;
  wideRows: HexGridWideRowType;
  onMouseDown: (e: MouseEvent, cell: HexGridCellType) => void;
  onMouseEnter: (e: MouseEvent, cell: HexGridCellType) => void;
  isStart: boolean;
  isTarget: boolean;
};

export function HexGridCell({
  cell,
  wideRows,
  onMouseDown,
  onMouseEnter,
  isStart,
  isTarget,
}: Props) {
  // Determine whether row is a "wide" row
  // Hex grid rows alternate between n - 1 and n items wide
  const isWideRow =
    wideRows === HexGridWideRowTypes.Even ? cell.y % 2 === 1 : cell.y % 2 === 0;

  const left =
    CELL_SPACING +
    cell.x * (CELL_WIDTH + CELL_SIDE_LENGTH + 2 * CELL_SPACING) +
    (!isWideRow ? 1.5 * CELL_SIDE_LENGTH + CELL_SPACING : 0); // Non-wide rows need extra padding on left

  const top = CELL_SPACING + cell.y * (CELL_SIDE_LENGTH - 0.5 * CELL_SPACING);

  return (
    <div
      className="hex-grid-cell relative"
      data-visited={cell.visited}
      data-on-path={cell.onPath}
      style={{
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
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
