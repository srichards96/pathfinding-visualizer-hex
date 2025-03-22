import { HexGridCellSizingData } from "../../types/hex-grid-cell-sizing-data";

type Options = {
  sideLength: number;
  spacing: number;
};

export function calculateHexCellSizingData({
  sideLength,
  spacing,
}: Options): HexGridCellSizingData {
  const width = sideLength * 2;
  const height = width / (1 + Math.cos(30));

  return {
    sideLength,
    width,
    height,
    spacing,
  };
}
