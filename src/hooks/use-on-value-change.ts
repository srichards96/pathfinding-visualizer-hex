import { useState } from "react";

/**
 * Runs callback when value changes. Runs immediately during render and not in an effect.
 *
 * ---
 *
 * If `T` is an object type, either
 * - `value` must have a stable reference (e.g. be memoized)
 * - optional `compareFn` (3rd parameter) must be provided to manually check for value equality
 *
 * Or else an infinite rerender loop will be triggered.
 */
export function useOnValueChange<T>(
  value: T,
  callback: (oldValue: T, newValue: T) => void,
  compareFn: (a: T, b: T) => boolean = Object.is,
) {
  const [prevValue, setPrevValue] = useState(value);

  if (!compareFn(prevValue, value)) {
    setPrevValue(value);
    callback(prevValue, value);
  }
}
