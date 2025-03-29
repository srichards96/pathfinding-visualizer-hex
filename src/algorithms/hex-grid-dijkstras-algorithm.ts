import { HexGridCellType } from "../types/hex-grid-cell-type";
import { HexGridPathfindingAlgorithm } from "../types/hex-grid-pathfinding-algorithm";
import { map2d } from "../util/array/map-2d";
import { getTraversal } from "../util/graph/get-traversal";
import { getHexNeighbors } from "../util/hex/get-hex-neighbors";

type DijkstrasNode = {
  x: number;
  y: number;
  wall: boolean;
  weight: number;
  distance: number;
  visited: boolean;
  parent: DijkstrasNode | null;
};

export const hexGridDijkstrasAlgorithm: HexGridPathfindingAlgorithm = ({
  grid,
  start,
  target,
  wideRows,
}) => {
  const dijkstrasGrid = map2d<HexGridCellType, DijkstrasNode>(
    grid,
    ({ x, y, wall, weight }) => ({
      x,
      y,
      wall,
      weight,
      distance: Infinity,
      visited: false,
      parent: null,
    })
  );

  const traversedNodes: DijkstrasNode[] = [];
  let endNode: DijkstrasNode | null = null;

  // Mark start as having distance of 0 and start priority queue with it
  dijkstrasGrid[start.y][start.x].distance = 0;
  dijkstrasGrid[start.y][start.x].visited = true;

  const queue = [dijkstrasGrid[start.y][start.x]];

  while (queue.length > 0) {
    queue.sort((a, z) => a.distance - z.distance);

    const curr = queue.shift()!;

    // If a node with a distance of infinity has been reached, the target is unreachable
    if (curr.distance === Infinity) {
      break;
    }

    traversedNodes.push(curr);

    // If target found, stop searching
    if (curr.x === target.x && curr.y === target.y) {
      endNode = curr;
      break;
    }

    // Otherwise queue up unvisited neighbors
    const neighbors = getHexNeighbors({
      grid: dijkstrasGrid,
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
        neighbor.distance = curr.distance + neighbor.weight;
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
