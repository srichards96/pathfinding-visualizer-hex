import { describe, expect, it, test } from "vitest";
import { makeHexGrid } from "./make-hex-grid";
import { HexGridWideRowTypes } from "../../constants/hex/hex-grid-wide-row-types";
import { HexGridCellType } from "../../types/hex-grid-cell-type";

describe("makeHexGrid", () => {
  it("should always have `rows` number of rows", () => {
    const rows = 10;
    const hexGrid = makeHexGrid({
      cols: 10,
      rows,
      wideRows: HexGridWideRowTypes.Odd,
    });

    expect(hexGrid).toHaveLength(rows);
  });

  test("when `cols` is even, the even/odd rows should have the same number of columns", () => {
    const cols = 18;
    const rows = 18;

    const hexGrid = makeHexGrid({
      cols,
      rows,
      wideRows: HexGridWideRowTypes.Even,
    });

    expect(hexGrid).toHaveLength(rows);

    const expectedLength = cols / 2;
    for (let i = 0; i < hexGrid.length; i++) {
      expect(hexGrid[i]).toHaveLength(expectedLength);
    }
  });

  test("when `cols` is odd, the specified `wideRows` should have an extra column", () => {
    const cols = 19;
    const rows = 19;

    const hexGridEvenWide = makeHexGrid({
      cols,
      rows,
      wideRows: HexGridWideRowTypes.Even,
    });
    const hexGridOddWide = makeHexGrid({
      cols,
      rows,
      wideRows: HexGridWideRowTypes.Odd,
    });

    expect(hexGridEvenWide).toHaveLength(rows);
    expect(hexGridOddWide).toHaveLength(rows);

    // wideRows = 'even' - Even rows (odd index) should have an extra column
    for (let i = 0; i < hexGridEvenWide.length; i++) {
      const isEvenRow = i % 2 === 1;
      const expectedCols = Math.floor(cols / 2) + (isEvenRow ? 1 : 0);

      expect(hexGridEvenWide[i]).toHaveLength(expectedCols);
    }

    // wideRows === 'odd' - Odd rows (even index) should have an extra column
    for (let i = 0; i < hexGridOddWide.length; i++) {
      const isOddRow = i % 2 === 0;
      const expectedCols = Math.floor(cols / 2) + (isOddRow ? 1 : 0);

      expect(hexGridOddWide[i]).toHaveLength(expectedCols);
    }
  });

  test("each element should have a unique reference", () => {
    const seenReferences = new Set<HexGridCellType>();

    const hexGrid = makeHexGrid({
      cols: 20,
      rows: 10,
      wideRows: HexGridWideRowTypes.Even,
    });

    for (const row of hexGrid) {
      for (const cell of row) {
        expect(seenReferences.has(cell)).toEqual(false);
        seenReferences.add(cell);
      }
    }
  });
});
