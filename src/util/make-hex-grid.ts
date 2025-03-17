import { HexGridCellType } from "../types/hex-grid-cell-type";

type Options = {
  rows: number;
  cols: number;
};
export function makeHexGrid({ rows, cols }: Options) {
  const grid: HexGridCellType[][] = [];

  for (let y = 0; y < rows; y++) {
    const row: HexGridCellType[] = [];

    for (let x = 0; x < cols; x++) {
      row.push({ x, y, weight: 0 });
    }
    // Add extra cell to every 2nd row
    if (y % 2 === 1) {
      row.push({ x: cols, y, weight: 0 });
    }

    grid.push(row);
  }

  return grid;
}
