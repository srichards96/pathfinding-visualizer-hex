import {
  HexGridWideRowType,
  HexGridWideRowTypes,
} from "../../constants/hex/hex-grid-wide-row-types";
import { HexGridPosition } from "../../types/hex-grid-position";

type Options = {
  point1: HexGridPosition;
  point2: HexGridPosition;
  wideRows: HexGridWideRowType;
};

export function getHexGridTaxicabDistance({
  point1,
  point2,
  wideRows,
}: Options) {
  const deltaX = Math.abs(point1.x - point2.x);
  const deltaY = Math.abs(point1.y - point2.y);

  if (deltaX === 0 && deltaY === 0) {
    return 0;
  }

  const point1WideRow =
    wideRows === HexGridWideRowTypes.Even
      ? point1.y % 2 === 1
      : point1.y % 2 === 0;
  const point2WideRow =
    wideRows === HexGridWideRowTypes.Even
      ? point2.y % 2 === 1
      : point2.y % 2 === 0;

  const sameRowType = point1WideRow === point2WideRow;

  if (sameRowType) {
    const gridDeltaX = deltaX * 2; // Always even
    const gridDeltaY = deltaY / 2; // DeltaY should always be even

    return gridDeltaX + Math.max(0, gridDeltaY - gridDeltaX / 2);
  } else {
    // GridDeltaX depends on whether point1 is on a wide row or not...
    const gridDeltaX = deltaX === 0 ? 1 : deltaX * 2 + (point1WideRow ? 1 : -1);
    const gridDeltaY = (deltaY - 1) / 2;

    // Both gridDeltaX and GridDeltaY must be > 0 if row types are different...
    return gridDeltaX + Math.max(0, gridDeltaY - Math.floor(gridDeltaX / 2));
  }
}
