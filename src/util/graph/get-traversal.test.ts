import { describe, expect, it } from "vitest";
import { getTraversal } from "./get-traversal";

type ListItem = { parent: ListItem | null };

const items: ListItem[] = [
  { parent: null },
  { parent: null },
  { parent: null },
  { parent: null },
  { parent: null },
];
items[4].parent = items[3];
items[3].parent = items[2];
items[2].parent = items[1];
items[1].parent = items[0];
// items[0] terminates

describe("getTraversal", () => {
  it("should return an empty array if `root` is null", () => {
    const traversal = getTraversal({ root: null, getParentFn: () => null });

    expect(traversal).toHaveLength(0);
  });

  it("should return array containing only the root if the root has no parent", () => {
    const root: ListItem = { parent: null };
    const traversal = getTraversal({ root, getParentFn: (i) => i.parent });

    expect(traversal).toHaveLength(1);
    expect(traversal[0]).toBe(root);
  });

  it("should return the items in the traversal in reverse order (last item first)", () => {
    const traversal = getTraversal({
      root: items[4],
      getParentFn: (i) => i.parent,
    });

    expect(traversal).toHaveLength(5);
    expect(traversal[0]).toEqual(items[0]);
    expect(traversal[1]).toEqual(items[1]);
    expect(traversal[2]).toEqual(items[2]);
    expect(traversal[3]).toEqual(items[3]);
    expect(traversal[4]).toEqual(items[4]);
  });

  it("should return references to the objects in the traversal", () => {
    const traversal = getTraversal({
      root: items[4],
      getParentFn: (i) => i.parent,
    });

    expect(traversal).toHaveLength(5);
    expect(traversal[0]).toBe(items[0]);
    expect(traversal[1]).toBe(items[1]);
    expect(traversal[2]).toBe(items[2]);
    expect(traversal[3]).toBe(items[3]);
    expect(traversal[4]).toBe(items[4]);
  });

  it("should throw an error if a cycle is encountered", () => {
    const cycleItems: ListItem[] = [
      { parent: null },
      { parent: null },
      { parent: null },
      { parent: null },
      { parent: null },
    ];
    cycleItems[4].parent = cycleItems[3];
    cycleItems[3].parent = cycleItems[2];
    cycleItems[2].parent = cycleItems[1];
    cycleItems[1].parent = cycleItems[3]; // Loop
    // cycleItems[0] terminates

    expect(() => {
      getTraversal({ root: cycleItems[4], getParentFn: (i) => i.parent });
    }).toThrowError();
  });
});
