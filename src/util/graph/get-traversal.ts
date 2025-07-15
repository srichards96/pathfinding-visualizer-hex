type Options<TNode> = {
  root: TNode;
  getParentFn: (node: TNode) => TNode | null | undefined;
};
export function getTraversal<TNode>({ root, getParentFn }: Options<TNode>) {
  const traversal: TNode[] = [];

  let slow: TNode | null | undefined = root;
  let fast: TNode | null | undefined = getParentFn(root);

  while (slow != null) {
    // Slow/fast will converge if they get stuck in a cycle
    if (slow === fast) {
      throw new Error("Cycle encountered during traversal!");
    }

    traversal.unshift(slow);

    slow = getParentFn(slow);

    // Move fast pointer twice per loop
    if (fast != null) {
      fast = getParentFn(fast);
    }
    if (fast != null) {
      fast = getParentFn(fast);
    }
  }

  return traversal;
}
