import { hexGridAStarSearch } from "../../algorithms/hex-grid-a-star-search";
import { hexGridBreadthFirstSearch } from "../../algorithms/hex-grid-breadth-first-search";
import { hexGridDijkstrasAlgorithm } from "../../algorithms/hex-grid-dijkstras-algorithm";
import { HexGridPathfindingAlgorithmName } from "../../constants/hex/hex-grid-pathfinding-algorithms";
import { HexGridWideRowType } from "../../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "../../types/hex-grid-cell-type";
import { HexGridPathfindingAlgorithm } from "../../types/hex-grid-pathfinding-algorithm";
import { HexGridPosition } from "../../types/hex-grid-position";

const nameToAlgorithmMap = {
  breadthFirstSearch: hexGridBreadthFirstSearch,
  dijkstrasAlgorithm: hexGridDijkstrasAlgorithm,
  aStar: hexGridAStarSearch,
} as const satisfies Record<
  HexGridPathfindingAlgorithmName,
  HexGridPathfindingAlgorithm
>;

type Options = {
  grid: HexGridCellType[][];
  start: HexGridPosition | undefined;
  target: HexGridPosition | undefined;
  algorithmName: HexGridPathfindingAlgorithmName;
  wideRows: HexGridWideRowType;
};
export function calculateHexGridPathfind({
  grid,
  start,
  target,
  algorithmName,
  wideRows,
}: Options) {
  if (start === undefined || target === undefined) {
    return;
  }

  return nameToAlgorithmMap[algorithmName]({
    grid,
    start,
    target,
    wideRows,
  });
}
