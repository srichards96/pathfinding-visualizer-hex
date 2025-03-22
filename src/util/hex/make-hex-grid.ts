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

  // Determine number of cols for normal/wide rows
  // - If cols is even, both rows have same number of rows
  // - If cols is odd, wide rows have +1 column from normal rows
  const normalRowCols = Math.floor(cols / 2);
  const wideRowCols = Math.ceil(cols / 2);

  for (let y = 0; y < rows; y++) {
    // Determine whether row is a "wide" row...
    const isWideRow =
      wideRows === HexGridWideRowTypes.Even ? y % 2 === 1 : y % 2 === 0;
    const colsForRow = isWideRow ? wideRowCols : normalRowCols;

    const row: HexGridCellType[] = [];

    for (let x = 0; x < colsForRow; x++) {
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

    grid.push(row);
  }

  return grid;
}
