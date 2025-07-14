import { describe, expect, it, vi } from "vitest";
import { map2d } from "./map-2d";

const array2d = [
  [
    { key: 1, value: 1 },
    { key: 2, value: 2 },
    { key: 3, value: 3 },
  ],
  [
    { key: 4, value: 4 },
    { key: 5, value: 5 },
    { key: 6, value: 6 },
  ],
  [
    { key: 7, value: 7 },
    { key: 8, value: 8 },
    { key: 9, value: 9 },
  ],
];

describe("map2d", () => {
  it("should run the `mapFn` against each element of the 2d array", () => {
    const elementCount = array2d
      .map((x) => x.length)
      .reduce((a, b) => a + b, 0);

    const mapFn = vi.fn((x) => x);
    map2d(array2d, mapFn);

    expect(mapFn).toHaveBeenCalledTimes(elementCount);
  });

  it("should pass (element, rowIndex, colIndex) as parameters to the `mapFn`", () => {
    const mapFn = vi.fn((x) => x);
    map2d(array2d, mapFn);

    let nthCall = 1;
    for (let y = 0; y < array2d.length; y++) {
      for (let x = 0; x < array2d[y].length; x++) {
        expect(mapFn).toHaveBeenNthCalledWith(nthCall++, array2d[y][x], y, x);
      }
    }
  });

  it("should create new arrays for both dimensions of the array", () => {
    const mapped = map2d(array2d, (x) => x);

    // 1st dimension array
    expect(mapped).toEqual(array2d); // Same value
    expect(mapped).not.toBe(array2d); // Different reference

    // 2nd dimension arrays
    for (let y = 0; y < array2d.length; y++) {
      expect(mapped[y]).toEqual(array2d[y]); // Same value
      expect(mapped[y]).not.toBe(array2d[y]); // Different reference
    }
  });

  it("should not create new references to object elements if `mapFn` returns the same object", () => {
    const array2dFlat = array2d.flatMap((x) => x);
    const sameObjectsMappedFlat = map2d(array2d, (x) => x).flatMap((x) => x);
    const newObjectsMappedFlat = map2d(array2d, (x) => ({ ...x })).flatMap(
      (x) => x
    );

    for (let i = 0; i < array2dFlat.length; i++) {
      // Same value, same references
      expect(sameObjectsMappedFlat[i]).toEqual(array2dFlat[i]);
      expect(sameObjectsMappedFlat[i]).toBe(array2dFlat[i]);
      // Same value, different references
      expect(newObjectsMappedFlat[i]).toEqual(array2dFlat[i]);
      expect(newObjectsMappedFlat[i]).not.toBe(array2dFlat[i]);
    }
  });
});
