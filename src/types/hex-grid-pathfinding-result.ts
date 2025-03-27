import { HexGridPosition } from "./hex-grid-position";

export type HexGridPathfindingResult = {
  cellsTraversed: HexGridPosition[];
  cellsOnPath: HexGridPosition[] | undefined;
};
