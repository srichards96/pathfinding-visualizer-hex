export const HexGridPathfindingAlgorithmNames = {
  breadthFirstSearch: "breadthFirstSearch",
  dijkstrasAlgorithm: "dijkstrasAlgorithm",
  aStar: "aStar",
} as const;

export type HexGridPathfindingAlgorithmName =
  (typeof HexGridPathfindingAlgorithmNames)[keyof typeof HexGridPathfindingAlgorithmNames];
