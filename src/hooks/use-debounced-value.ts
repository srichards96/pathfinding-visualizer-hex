import { useEffect, useState } from "react";
import { useOnValueChange } from "./use-on-value-change";

export function useDebouncedValue<T>(value: T, delay: number | null) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  // When `value` changes, if `delay` is null, update `debouncedValue` immediately
  useOnValueChange(value, () => {
    if (delay == null) {
      setDebouncedValue(value);
    }
  });

  // When `delay` changes, if `delay` is null, update `debouncedValue` immediately
  useOnValueChange(delay, () => {
    if (delay == null) {
      setDebouncedValue(value);
    }
  });

  // When `value` or `delay` changes, if `delay` is not null, set up a timeout to update `debouncedValue`
  useEffect(() => {
    if (delay == null) {
      return;
    }

    const handle = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handle);
    };
  }, [value, delay]);

  return debouncedValue;
}
