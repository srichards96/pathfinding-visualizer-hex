import { useEffect, useRef } from "react";

export function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) {
      return;
    }

    const handle = setInterval(() => {
      callbackRef.current();
    }, delay);

    return () => {
      clearInterval(handle);
    };
  }, [delay]);
}
