import { HexGridWideRowType } from "../../constants/hex/hex-grid-wide-row-types";
import { HexGridCellSizingData } from "../../types/hex-grid-cell-sizing-data";
import { HexGridCellType } from "../../types/hex-grid-cell-type";
import { makeHexGrid } from "./make-hex-grid";

type Options = {
  grid: HexGridCellType[][];
  element: HTMLDivElement;
  hexCellSizingData: HexGridCellSizingData;
  wideRows: HexGridWideRowType;
};

export function resizeHexGridToFitContainer({
  grid,
  element,
  hexCellSizingData,
  wideRows,
}: Options) {
  const { paddingLeft, paddingRight, paddingTop, paddingBottom } =
    getComputedStyle(element);
  const { clientWidth, clientHeight } = element;

  const width =
    clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
  const height =
    clientHeight - parseFloat(paddingTop) - parseFloat(paddingBottom);

  const {
    width: cellWidth,
    height: cellHeight,
    spacing: cellSpacing,
  } = hexCellSizingData;

  const cols =
    Math.floor((width - cellWidth) / (0.75 * cellWidth + cellSpacing)) + 1;
  const rows =
    Math.floor((height - cellHeight) / (0.5 * cellHeight + 0.5 * cellSpacing)) +
    1;

  const newGrid = makeHexGrid({ rows, cols, wideRows });

  // Copy over parts of old grid that fit in the new grid...
  const highestSharedRowIndex = Math.min(grid.length, newGrid.length);
  for (let y = 0; y < highestSharedRowIndex; y++) {
    const highestSharedCellIndex = Math.min(grid[y].length, newGrid[y].length);
    for (let x = 0; x < highestSharedCellIndex; x++) {
      newGrid[y][x] = grid[y][x];
    }
  }

  return newGrid;
}
