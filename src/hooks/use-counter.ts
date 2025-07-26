import { useCallback, useState } from "react";

export function useCounter(initialValue: number = 0) {
  const [value, setValue] = useState(initialValue);

  const increment = useCallback(() => {
    setValue((v) => v + 1);
  }, []);

  const decrement = useCallback(() => {
    setValue((v) => v - 1);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return {
    value,
    setValue,
    increment,
    decrement,
    reset,
  };
}
