import {
  HexGridWideRowType,
  HexGridWideRowTypes,
} from "../../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "../../types/hex-grid-cell-type";

type Options = {
  rows: number;
  cols: number;
  wideRows: HexGridWideRowType;
};
/**
 * Created 2d array representing a hexagonal grid, where rows alternate between n - 1 and n elements
 */
export function makeHexGrid({ rows, cols, wideRows }: Options) {
  const grid: HexGridCellType[][] = [];

  for (let y = 0; y < rows; y++) {
    // Determine whether row is a "wide" row
    // Hex grid rows alternate between n and n + 1 items wide
    const isWideRow =
      wideRows === HexGridWideRowTypes.Even ? y % 2 === 1 : y % 2 === 0;

    const row: HexGridCellType[] = [];

    for (let x = 0; x < cols - 1; x++) {
      row.push({
        x,
        y,
        weight: 0,
        visited: false,
        onPath: false,
        isStart: false,
        isTarget: false,
      });
    }
    // Add extra cell to every 2nd row
    if (isWideRow) {
      row.push({
        x: cols - 1,
        y,
        weight: 0,
        visited: false,
        onPath: false,
        isStart: false,
        isTarget: false,
      });
    }

    grid.push(row);
  }

  return grid;
}
