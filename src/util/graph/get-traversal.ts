type Options<TNode> = {
  root: TNode;
  getParentFn: (node: TNode) => TNode | null | undefined;
};
export function getTraversal<TNode>({ root, getParentFn }: Options<TNode>) {
  const traversal: TNode[] = [];

  let curr: TNode | null | undefined = root;
  while (curr != null) {
    traversal.unshift(curr);
    curr = getParentFn(curr);
  }

  return traversal;
}
