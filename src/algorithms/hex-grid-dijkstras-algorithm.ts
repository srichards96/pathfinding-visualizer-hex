import { PriorityQueue } from "../data-structures/priority-queue";
import { HexGridCellType } from "../types/hex-grid-cell-type";
import { HexGridPathfindingAlgorithm } from "../types/hex-grid-pathfinding-algorithm";
import { map2d } from "../util/array/map-2d";
import { getTraversal } from "../util/graph/get-traversal";
import { getHexNeighbors } from "../util/hex/get-hex-neighbors";

type DijkstrasNode = {
  id: number;
  x: number;
  y: number;
  wall: boolean;
  weight: number;
  visited: boolean;
  parent: DijkstrasNode | null;
};

export const hexGridDijkstrasAlgorithm: HexGridPathfindingAlgorithm = ({
  grid,
  start,
  target,
  wideRows,
}) => {
  let id = 0;
  let neighborCounter = 0;

  const dijkstrasGrid = map2d<HexGridCellType, DijkstrasNode>(
    grid,
    ({ x, y, wall, weight }) => ({
      id: id++,
      x,
      y,
      wall,
      weight,
      visited: false,
      parent: null,
    })
  );

  const traversedNodes: DijkstrasNode[] = [];
  let endNode: DijkstrasNode | null = null;

  // Create priority queue and add start position to it
  const priorityQueue = new PriorityQueue({
    getKeyFn: (item: DijkstrasNode) => item.id,
  });
  dijkstrasGrid[start.y][start.x].visited = true;
  priorityQueue.add(dijkstrasGrid[start.y][start.x], 0);

  while (priorityQueue.size > 0) {
    const { data: curr, priority: currDistance } = priorityQueue.pull()!;

    // // If a node with a distance of infinity has been reached, the target is unreachable
    // if (curr.distance === Infinity) {
    //   break;
    // }

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

    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];

      if (!neighbor.visited) {
        // This offset isn't necessary.
        // It's a hack that makes it so that the nodes with equal distance are visited in the
        //   same order that they were added in (top, top-right, bottom-right, bottom, bottom-left, top-left)
        // Because the PriorityQueue does not maintain insert-order of items with equal priority,
        //   neighbors added with the same priority won't be retrieved in the same order.
        // E.g. top, top-right, and bottom-right might all have a priority of 1, but they won't
        //   necessarily be retrived in the order top, top-right, bottom-right
        // So each priority is globally offset by some tiny amount, to maintain insert-order...
        // So then, top will have priority 1.000000, top-right 1.0000001, bottom-right 1.0000002,
        //   so they'll be retrived in order top, top-right, bottom-right...
        // This doesn't interfere with the search because weights are always integers
        const offset = neighborCounter++ * 0.0000001;

        const priority = Math.floor(currDistance) + neighbor.weight;
        neighbor.visited = true;
        neighbor.parent = curr;
        priorityQueue.add(neighbor, priority + offset);
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
