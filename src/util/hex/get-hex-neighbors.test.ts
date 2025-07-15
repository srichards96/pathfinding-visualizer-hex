import { describe, expect, it, test } from "vitest";
import { getHexNeighbors } from "./get-hex-neighbors";
import { makeHexGrid } from "./make-hex-grid";
import { HexGridWideRowTypes } from "../../constants/hex/hex-grid-wide-row-types";

const wideRows = HexGridWideRowTypes.Even;
const wideRowsGrid = makeHexGrid({ rows: 10, cols: 20, wideRows });

describe("getHexNeighbors", () => {
  it("should always return an array with 6 elements", () => {
    const neighbors = getHexNeighbors({
      grid: wideRowsGrid,
      x: 0,
      y: 0,
      wideRows,
    });

    expect(neighbors).toHaveLength(6);
  });

  test("when `x` and `y` are not on grid boundaries, all 6 neighbors should be defined", () => {
    const neighbors = getHexNeighbors({
      grid: wideRowsGrid,
      x: 5,
      y: 5,
      wideRows,
    });

    for (const n of neighbors) {
      console.log(n);
      expect(n).toBeDefined();
    }
  });

  test("when `x` or `y` is on a grid boundary, some neighbors will be null", () => {
    const xBoundaryNeighbors = getHexNeighbors({
      grid: wideRowsGrid,
      x: 0,
      y: 5,
      wideRows,
    });

    const xBoundaryNullNeighbors = xBoundaryNeighbors.filter((n) => n === null);
    expect(xBoundaryNullNeighbors.length).greaterThanOrEqual(1);

    const yBoundaryNeighbors = getHexNeighbors({
      grid: wideRowsGrid,
      x: 5,
      y: 0,
      wideRows,
    });

    const yBoundaryNullNeighbors = yBoundaryNeighbors.filter((n) => n === null);
    expect(yBoundaryNullNeighbors.length).greaterThanOrEqual(1);
  });

  it("should return references to the neighbors", () => {
    // Both sets of neighbor should point to the same objects
    const neighbors1 = getHexNeighbors({
      grid: wideRowsGrid,
      x: 5,
      y: 5,
      wideRows,
    });
    const neighbors2 = getHexNeighbors({
      grid: wideRowsGrid,
      x: 5,
      y: 5,
      wideRows,
    });

    for (let i = 0; i < neighbors1.length; i++) {
      expect(neighbors1[i]).toBe(neighbors2[i]);
    }
  });
});
