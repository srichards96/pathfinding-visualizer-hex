import { HexGridCellType } from "../types/hex-grid-cell-type";

// Some math to calculate various values for sizing cells...
const CELL_SIDE_LENGTH = 30; // Length of each side of hexagon
const CELL_WIDTH = CELL_SIDE_LENGTH * 2; // Width of container...
const CELL_HEIGHT = CELL_WIDTH / (1 + Math.cos(30)); // Height of container (for a equilateral hexagon)
const CELL_SPACING = 4;

type Props = {
  cell: HexGridCellType;
  evenRow: boolean;
  visited: boolean;
};

export function HexGridCell({ cell, evenRow, visited }: Props) {
  const left =
    CELL_SPACING +
    cell.x * (CELL_WIDTH + CELL_SIDE_LENGTH + 2 * CELL_SPACING) +
    (evenRow ? 1.5 * CELL_SIDE_LENGTH + CELL_SPACING : 0); // Offset for every odd row...

  const top = CELL_SPACING + cell.y * (CELL_SIDE_LENGTH - 0.5 * CELL_SPACING);

  return (
    <div
      className="hex-grid-cell"
      data-visited={visited}
      style={{
        width: CELL_WIDTH,
        height: CELL_HEIGHT,
        position: "absolute",
        transform: `translate3D(${left}px, ${top}px, 0)`,
      }}
    />
  );
}
