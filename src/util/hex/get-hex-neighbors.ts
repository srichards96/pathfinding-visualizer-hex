import {
  HexGridWideRowType,
  HexGridWideRowTypes,
} from "../../constants/hex/hex-grid-wide-row-types";

type Options<TItem> = {
  grid: TItem[][];
  x: number;
  y: number;
  wideRows: HexGridWideRowType;
};
/**
 * Gets neighbors of a cell of a 2d array representing a hexagonal grid
 *
 * Expects 2d array rows to alternate between n - 1 and n elements
 *
 * Returns neighbors in order: top, top-right, bottom-right, bottom, bottom-left, top-left
 *
 * If a neighbor would be out-of-bounds, `null` is returned instead
 */
export function getHexNeighbors<TItem>({
  grid,
  x,
  y,
  wideRows,
}: Options<TItem>) {
  // Determine whether row is a "wide" row
  // Hex grid rows alternate between n - 1 and n items wide
  const isWideRow =
    wideRows === HexGridWideRowTypes.Even ? y % 2 === 1 : y % 2 === 0;

  return [
    grid[y - 2]?.[x] ?? null, //                                    Top
    isWideRow ? grid[y - 1]?.[x] : grid[y - 1]?.[x + 1] ?? null, // Top-right
    isWideRow ? grid[y + 1]?.[x] : grid[y + 1]?.[x + 1] ?? null, // Bottom-right
    grid[y + 2]?.[x] ?? null, //                                    Bottom
    isWideRow ? grid[y + 1]?.[x - 1] : grid[y + 1]?.[x] ?? null, // Bottom-left
    isWideRow ? grid[y - 1]?.[x - 1] : grid[y - 1]?.[x] ?? null, // Top-left
  ] as (TItem | null)[];
}
