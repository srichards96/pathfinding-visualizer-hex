import { HexGridWideRowType } from "../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "./hex-grid-cell-type";
import { HexGridPathfindingResult } from "./hex-grid-pathfinding-result";
import { HexGridPosition } from "./hex-grid-position";

type HexGridPathfindingAlgorithmOptions = {
  grid: HexGridCellType[][];
  start: HexGridPosition;
  target: HexGridPosition;
  wideRows: HexGridWideRowType;
};

export type HexGridPathfindingAlgorithm = (
  options: HexGridPathfindingAlgorithmOptions
) => HexGridPathfindingResult;
