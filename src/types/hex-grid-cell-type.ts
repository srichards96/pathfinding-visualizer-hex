export type HexGridCellType = {
  x: number;
  y: number;
  weight: number;
  visited: boolean;
  onPath: boolean;
  isStart: boolean;
  isTarget: boolean;
};
