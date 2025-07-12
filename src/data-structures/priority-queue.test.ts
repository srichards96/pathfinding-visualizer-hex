import { beforeEach, describe, expect, it } from "vitest";
import { PriorityQueue } from "./priority-queue";

type Item = { key: number };
const items: Item[] = [
  { key: 1 },
  { key: 2 },
  { key: 3 },
  { key: 4 },
  { key: 5 },
  { key: 6 },
  { key: 7 },
  { key: 8 },
  { key: 9 },
  { key: 10 },
];

describe("PriorityQueue", () => {
  let priorityQueue = new PriorityQueue({ getKeyFn: (i: Item) => i.key });

  beforeEach(() => {
    priorityQueue = new PriorityQueue({ getKeyFn: (i: Item) => i.key });
    priorityQueue.add(items[0], 3);
    priorityQueue.add(items[1], 7);
    priorityQueue.add(items[2], 6);
    priorityQueue.add(items[3], 2);
    priorityQueue.add(items[4], 8);
    priorityQueue.add(items[5], 4);
    priorityQueue.add(items[6], 0);
    priorityQueue.add(items[7], 9);
    priorityQueue.add(items[8], 1);
    priorityQueue.add(items[9], 5);
  });

  it("should return the number of items in the queue when `size` is called", () => {
    expect(priorityQueue.size).toEqual(10);

    priorityQueue.pull();
    expect(priorityQueue.size).toEqual(9);

    priorityQueue.pull();
    expect(priorityQueue.size).toEqual(8);

    priorityQueue.add({ key: 11 }, 10);
    expect(priorityQueue.size).toEqual(9);
  });

  it("should return and remove the item with the lowest priority when `pull` is called", () => {
    expect(priorityQueue.size).toEqual(10);

    expect(priorityQueue.pull()).toEqual({ priority: 0, data: items[6] });
    expect(priorityQueue.size).toEqual(9);

    expect(priorityQueue.pull()).toEqual({ priority: 1, data: items[8] });
    expect(priorityQueue.size).toEqual(8);

    expect(priorityQueue.pull()).toEqual({ priority: 2, data: items[3] });
    expect(priorityQueue.size).toEqual(7);

    expect(priorityQueue.pull()).toEqual({ priority: 3, data: items[0] });
    expect(priorityQueue.size).toEqual(6);

    expect(priorityQueue.pull()).toEqual({ priority: 4, data: items[5] });
    expect(priorityQueue.size).toEqual(5);
  });

  it("should return `undefined` if 'pull' is called while the queue is empty", () => {
    const emptyQueue = new PriorityQueue({ getKeyFn: (i: Item) => i.key });
    expect(emptyQueue.size).toEqual(0);
    expect(emptyQueue.pull()).toEqual(undefined);
  });

  it("should return but not remove the item with the lowest priority when `peek` is called", () => {
    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: 0, data: items[6] });

    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: 0, data: items[6] });

    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: 0, data: items[6] });
  });

  it("should return `undefined` if `peek` is called while the queue is empty", () => {
    const emptyQueue = new PriorityQueue({ getKeyFn: (i: Item) => i.key });
    expect(emptyQueue.size).toEqual(0);
    expect(emptyQueue.peek()).toEqual(undefined);
  });

  it("should maintain the heap invariant when items are added (`add`) or removed (`pull`)", () => {
    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: 0, data: items[6] });

    // Add low priority - no change
    priorityQueue.add({ key: 11 }, 10);
    expect(priorityQueue.size).toEqual(11);
    expect(priorityQueue.peek()).toEqual({ priority: 0, data: items[6] });

    // Add new highest priority item - should now return new highest
    priorityQueue.add({ key: 12 }, -1);
    expect(priorityQueue.size).toEqual(12);
    expect(priorityQueue.peek()).toEqual({ priority: -1, data: { key: 12 } });

    // Remove new highest priority item - should now return old highest
    priorityQueue.pull();
    expect(priorityQueue.size).toEqual(11);
    expect(priorityQueue.peek()).toEqual({ priority: 0, data: items[6] });

    // Remove old highest priority item - should now return old 2nd highest
    priorityQueue.pull();
    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: 1, data: items[8] });
  });

  it("should maintain the heap invariant when `setPriority` is used to update the priority of an item", () => {
    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: 0, data: items[6] });

    priorityQueue.setPriority(4, -1); // items[3]
    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: -1, data: items[3] });

    priorityQueue.setPriority(4, 11); // items[3]
    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: 0, data: items[6] });

    priorityQueue.setPriority(7, 12); // items[6]
    expect(priorityQueue.size).toEqual(10);
    expect(priorityQueue.peek()).toEqual({ priority: 1, data: items[8] });
  });

  it("should return whether an item is included in the queue when `has` is called", () => {
    expect(priorityQueue.has(7)).toEqual(true); // items[6]
    expect(priorityQueue.has(3)).toEqual(true); // items[2]
    expect(priorityQueue.has(11)).toEqual(false); // Doesn't exist

    priorityQueue.add({ key: 11 }, 10); // Make it exist...
    expect(priorityQueue.has(11)).toEqual(true); // Should now exist
  });
});
