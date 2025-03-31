type GetKeyFn<TItem, TKey extends number | string> = (item: TItem) => TKey;

type PriorityQueueItem<TItem> = {
  priority: number;
  data: TItem;
};

type ConstructorArgs<TItem, TKey extends number | string> = {
  /**
   * Gets unique key value for each item
   */
  getKeyFn: GetKeyFn<TItem, TKey>;
};

export class PriorityQueue<TItem, TKey extends number | string> {
  private getKeyFn: GetKeyFn<TItem, TKey>;
  private array: TItem[] = [];

  // Maps from item key to index in items array
  private keyToIndexMap: Map<TKey, number> = new Map();
  // Maps from item index to priority value
  private indexToPriorityMap: Map<number, number> = new Map();

  constructor({ getKeyFn }: ConstructorArgs<TItem, TKey>) {
    this.getKeyFn = getKeyFn;
  }

  private indexToKey(index: number) {
    return this.getKeyFn(this.array[index]);
  }

  private indexToPriority(index: number) {
    const priority = this.indexToPriorityMap.get(index);
    if (priority === undefined) {
      throw `No priority exists for index '${index}'`;
    }
    return priority;
  }

  private keyToIndex(key: TKey) {
    const index = this.keyToIndexMap.get(key);
    if (index === undefined) {
      throw `No index exists for key '${key}'`;
    }
    return index;
  }

  private getParentIndex(index: number) {
    return Math.floor((index - 1) / 2);
  }
  private getLeftChildIndex(index: number) {
    return index * 2 + 1;
  }
  private getRightChildIndex(index: number) {
    return index * 2 + 2;
  }

  private hasParent(index: number) {
    return this.getParentIndex(index) >= 0;
  }
  private hasLeftChild(index: number) {
    return this.getLeftChildIndex(index) < this.array.length;
  }
  private hasRightChild(index: number) {
    return this.getRightChildIndex(index) < this.array.length;
  }

  private getParentPriority(index: number) {
    return this.indexToPriority(this.getParentIndex(index));
  }
  private getLeftChildPriority(index: number) {
    return this.indexToPriority(this.getLeftChildIndex(index));
  }
  private getRightChildPriority(index: number) {
    return this.indexToPriority(this.getRightChildIndex(index));
  }

  private heapifyDown(index: number = 0) {
    if (this.array.length === 0) {
      return;
    }

    while (this.hasLeftChild(index)) {
      const childIndex =
        this.hasRightChild(index) &&
        this.getRightChildPriority(index) < this.getLeftChildPriority(index)
          ? this.getRightChildIndex(index)
          : this.getLeftChildIndex(index);

      if (this.indexToPriority(index) <= this.indexToPriority(childIndex)) {
        break;
      }

      this.swap(index, childIndex);
      index = childIndex;
    }
  }

  private heapifyUp(index?: number) {
    if (this.array.length === 0) {
      return;
    }

    index ??= this.array.length - 1;

    while (
      this.hasParent(index) &&
      this.getParentPriority(index) > this.indexToPriority(index)
    ) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  }

  private pop(): PriorityQueueItem<TItem> | undefined {
    if (this.array.length === 0) {
      return undefined;
    }

    const index = this.array.length - 1;
    const key = this.indexToKey(index);

    const data = this.array.pop()!;
    const priority = this.indexToPriority(index);
    this.keyToIndexMap.delete(key);
    this.indexToPriorityMap.delete(index);

    return { priority, data };
  }

  private swap(index1: number, index2: number) {
    const key1 = this.indexToKey(index1);
    const key2 = this.indexToKey(index2);

    // Swap items
    const itemTemp = this.array[index1];
    this.array[index1] = this.array[index2];
    this.array[index2] = itemTemp;

    // Swap key-to-index mappings
    const indexTemp = this.keyToIndex(key1);
    this.keyToIndexMap.set(key1, this.keyToIndexMap.get(key2)!);
    this.keyToIndexMap.set(key2, indexTemp);

    // Swap index-to-priority mappings
    const priorityTemp = this.indexToPriority(index1);
    this.indexToPriorityMap.set(index1, this.indexToPriorityMap.get(index2)!);
    this.indexToPriorityMap.set(index2, priorityTemp);
  }

  public add(item: TItem, priority: number) {
    const index = this.array.push(item) - 1;
    const key = this.getKeyFn(item);

    this.keyToIndexMap.set(key, index);
    this.indexToPriorityMap.set(index, priority);

    this.heapifyUp();
  }

  public peek(): PriorityQueueItem<TItem> | undefined {
    if (this.array.length === 0) {
      return undefined;
    }

    const priority = this.indexToPriority(0);
    const data = this.array[0];

    return { priority, data };
  }

  public pull(): PriorityQueueItem<TItem> | undefined {
    if (this.array.length === 0) {
      return undefined;
    }

    this.swap(0, this.array.length - 1);
    const result = this.pop();
    this.heapifyDown();

    return result;
  }

  public setPriority(key: TKey, newPriority: number) {
    const index = this.keyToIndex(key);
    const oldPriority = this.indexToPriority(index);

    if (newPriority === oldPriority) {
      return;
    }

    this.indexToPriorityMap.set(index, newPriority);

    // Lower value = "higher" priority
    if (newPriority < oldPriority) {
      this.heapifyUp(index);
    } else {
      this.heapifyDown(index);
    }
  }

  public has(key: TKey) {
    return this.keyToIndexMap.has(key);
  }

  get size() {
    return this.array.length;
  }
}
