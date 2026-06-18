import { useEffect, useState } from "react";

type Props<T> = {
  value: T;
  delay: number;
  /** Determines if value should be debounced. True = debounced. False = instant */
  condition: (v: T) => boolean;
};

// TODO: rewrite so that eslint suppression is unnecessary...
export function useConditionalDebounceValue<T>({
  value,
  delay,
  condition,
}: Props<T>) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (condition(value)) {
      const handle = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handle);
      };
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDebouncedValue(value);
    }
  }, [value, delay, condition]);

  return debouncedValue;
}
