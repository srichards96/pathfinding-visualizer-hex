import { HexGridPosition } from "./hex-grid-position";

export type PathfindingResult = {
  cellsTraversed: HexGridPosition[];
  cellsOnPath: HexGridPosition[] | undefined;
};
