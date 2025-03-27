import { HexGridCellType } from "../types/hex-grid-cell-type";
import { HexGridPathfindingAlgorithm } from "../types/hex-grid-pathfinding-algorithm";
import { map2d } from "../util/array/map-2d";
import { getTraversal } from "../util/graph/get-traversal";
import { getHexNeighbors } from "../util/hex/get-hex-neighbors";

type BFSNode = {
  x: number;
  y: number;
  wall: boolean;
  visited: boolean;
  parent: BFSNode | null;
};

export const hexGridBreadthFirstSearch: HexGridPathfindingAlgorithm = ({
  grid,
  start,
  target,
  wideRows,
}) => {
  const bfsGrid = map2d<HexGridCellType, BFSNode>(grid, ({ x, y, wall }) => ({
    x,
    y,
    wall,
    visited: false,
    parent: null,
  }));

  const traversedNodes: BFSNode[] = [];
  let endNode: BFSNode | null = null;

  // Mark start as visited and start queue with it
  bfsGrid[start.y][start.x].visited = true;
  const queue = [bfsGrid[start.y][start.x]];

  while (queue.length > 0) {
    const curr = queue.shift()!;

    traversedNodes.push(curr);

    // If target found, stop searching...
    if (curr.x === target.x && curr.y === target.y) {
      endNode = curr;
      break;
    }

    // Otherwise, queue up unvisited neighbors
    const neighbors = getHexNeighbors({
      grid: bfsGrid,
      x: curr.x,
      y: curr.y,
      wideRows,
    })
      // Not out-of-bounds
      .filter((x) => x != null)
      // Not a wall
      .filter((x) => x.wall === false);

    for (const neighbor of neighbors) {
      if (!neighbor.visited) {
        neighbor.visited = true;
        neighbor.parent = curr;
        queue.push(neighbor);
      }
    }
  }

  const path =
    endNode != null
      ? getTraversal({ root: endNode, getParentFn: (n) => n?.parent })
      : undefined;

  return {
    cellsTraversed: traversedNodes.map(({ x, y }) => ({ x, y })),
    cellsOnPath: path?.map(({ x, y }) => ({ x, y })),
  };
};
