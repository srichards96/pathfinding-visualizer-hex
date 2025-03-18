import { HexGridWideRowType } from "../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "../types/hex-grid-cell-type";
import { map2d } from "../util/array/map-2d";
import { getTraversal } from "../util/graph/get-traversal";
import { getHexNeighbors } from "../util/hex/get-hex-neighbors";

type BFSNode = {
  x: number;
  y: number;
  visited: boolean;
  parent: BFSNode | null;
};

type Options = {
  grid: HexGridCellType[][];
  start: HexGridCellType;
  target: HexGridCellType;
  wideRows: HexGridWideRowType;
};
export function breadthFirstSearch({ grid, start, target, wideRows }: Options) {
  const bfsGrid = map2d(
    grid,
    ({ x, y }) => ({ x, y, visited: false, parent: null } as BFSNode)
  );

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
    }).filter((x) => x != null);

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

  return [
    // Only return x/y positions
    traversedNodes.map(({ x, y }) => ({ x, y })),
    path?.map(({ x, y }) => ({ x, y })),
  ] as const;
}
