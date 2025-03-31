import { PriorityQueue } from "../data-structures/priority-queue";
import { HexGridCellType } from "../types/hex-grid-cell-type";
import { HexGridPathfindingAlgorithm } from "../types/hex-grid-pathfinding-algorithm";
import { map2d } from "../util/array/map-2d";
import { getTraversal } from "../util/graph/get-traversal";
import { getHexGridTaxicabDistance } from "../util/hex/get-hex-grid-taxicab-distance";
import { getHexNeighbors } from "../util/hex/get-hex-neighbors";

type AStarNode = {
  id: number;
  x: number;
  y: number;
  wall: boolean;
  weight: number;
  parent: AStarNode | null;
};

export const hexGridAStarSearch: HexGridPathfindingAlgorithm = ({
  grid,
  start,
  target,
  wideRows,
}) => {
  let id = 0;
  let neighborCounter = 0;

  const aStarGrid = map2d<HexGridCellType, AStarNode>(
    grid,
    ({ x, y, wall, weight }) => ({
      id: id++,
      x,
      y,
      wall,
      weight,
      parent: null,
    })
  );

  const traversedNodes: AStarNode[] = [];
  let endNode: AStarNode | null = null;

  // Tracks distance of node from start
  const gScore = new Map<number, number>();
  gScore.set(aStarGrid[start.y][start.x].id, 0);

  // Create priority queue and add start position to it
  // Priority is an estimate of distance between start and target (going though specific node)
  const priorityQueue = new PriorityQueue({
    getKeyFn: (item: AStarNode) => item.id,
  });
  priorityQueue.add(
    aStarGrid[start.y][start.x],
    getHexGridTaxicabDistance({ point1: start, point2: target, wideRows })
  );

  while (priorityQueue.size > 0) {
    const { data: curr } = priorityQueue.pull()!;

    traversedNodes.push(curr);

    // If target found, stop searching
    if (curr.x === target.x && curr.y === target.y) {
      endNode = curr;
      break;
    }

    // Otherwise queue up unvisited neighbors
    const neighbors = getHexNeighbors({
      grid: aStarGrid,
      x: curr.x,
      y: curr.y,
      wideRows,
    })
      // Not out-of-bounds
      .filter((x) => x != null)
      // Not a wall
      .filter((x) => x.wall === false);

    for (const neighbor of neighbors) {
      const currGScore = gScore.get(curr.id) ?? Infinity;
      const neighborGScore = gScore.get(neighbor.id) ?? Infinity;
      const tentativeGScore = currGScore + neighbor.weight;

      if (tentativeGScore < neighborGScore) {
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

        neighbor.parent = curr;

        gScore.set(neighbor.id, tentativeGScore);

        // Priority is how far the neighbor is from the target
        const priority =
          tentativeGScore +
          getHexGridTaxicabDistance({
            point1: neighbor,
            point2: target,
            wideRows,
          });

        if (priorityQueue.has(neighbor.id)) {
          priorityQueue.setPriority(neighbor.id, priority + offset);
        } else {
          priorityQueue.add(neighbor, priority + offset);
        }
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
