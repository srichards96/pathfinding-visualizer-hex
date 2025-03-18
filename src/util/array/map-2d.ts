/**
 * Applies given `mapFn` to each element of a 2d array
 */
export function map2d<TItem, TMappedItem>(
  array: TItem[][],
  mapFn: (i: TItem, i0: number, i1: number) => TMappedItem
) {
  return array.map((level0, i0) =>
    level0.map((level1, i1) => mapFn(level1, i0, i1))
  );
}
