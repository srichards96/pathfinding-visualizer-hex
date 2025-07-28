import { renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, test, vi } from "vitest";
import { useConditionalDebounceValue } from "./use-conditional-debounce-value";
import { act } from "react";

type UseConditionalDebounceValueProps<T> = {
  value: T;
  delay: number;
  condition: (v: T) => boolean;
};

describe("useDebouncedValue", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("should initially return the first `value`", () => {
    const value = "abcde";

    const { result } = renderHook(() =>
      useConditionalDebounceValue({
        value,
        delay: 1000,
        condition: vi.fn(),
      })
    );

    expect(result.current).toEqual(value);
  });

  describe("`condition(value)` is `true`", () => {
    it("should call `setTimeout` on mount", () => {
      vi.spyOn(window, "setTimeout");

      renderHook(() =>
        useConditionalDebounceValue({
          value: "abcde",
          delay: 1000,
          condition: () => true,
        })
      );

      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    it("should call `setTimeout` when `value` changes", () => {
      const delay = 1000;
      const condition = () => true;
      vi.spyOn(window, "setTimeout");

      const { rerender } = renderHook(
        (
          props: UseConditionalDebounceValueProps<unknown> = {
            value: "abcde",
            delay,
            condition,
          }
        ) => useConditionalDebounceValue(props)
      );

      expect(setTimeout).toHaveBeenCalledTimes(1);

      rerender({ value: "12345", delay, condition });

      expect(setTimeout).toHaveBeenCalledTimes(2);
    });

    test("when `condition(value)` changes to `false`, `setTimeout` should not be called", () => {
      const delay = 1000;
      const condition = (v: string) => v === "abcde";
      vi.spyOn(window, "setTimeout");

      const { rerender } = renderHook(
        (
          props: UseConditionalDebounceValueProps<string> = {
            value: "abcde",
            delay,
            condition,
          }
        ) => useConditionalDebounceValue(props)
      );

      expect(setTimeout).toHaveBeenCalledTimes(1);

      rerender({ value: "12345", delay, condition });

      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    test("when `value` changes, the old value should still be returned for `delay` ms", () => {
      const value1 = "abcde";
      const delay = 1000;
      const condition = () => true;

      const { result, rerender } = renderHook(
        (
          props: UseConditionalDebounceValueProps<string> = {
            value: value1,
            delay,
            condition,
          }
        ) => useConditionalDebounceValue(props)
      );

      // Initial value
      expect(result.current).toEqual(value1);

      const value2 = "12345";
      rerender({ value: value2, delay, condition });
      // Still value1
      expect(result.current).toEqual(value1);

      act(() => {
        vi.advanceTimersByTime(delay - 1);
      });
      // Still value1
      expect(result.current).toEqual(value1);

      const value3 = "00000";
      rerender({ value: value3, delay, condition });
      // Still value1
      expect(result.current).toEqual(value1);

      act(() => {
        vi.advanceTimersByTime(delay - 1);
      });
      // Still value1
      expect(result.current).toEqual(value1);

      act(() => {
        vi.advanceTimersByTime(1);
      });
      // Now value3 (value2 skipped over)
      expect(result.current).toEqual(value3);
    });

    test("when `condition(value)` changes to `false`, the new value should be returned immediately", () => {
      const value1 = "abcde";
      const value2 = "12345";
      const delay = 1000;
      const condition = (v: string) => v === value1 || v === value2;

      const { result, rerender } = renderHook(
        (
          props: UseConditionalDebounceValueProps<string> = {
            value: value1,
            delay,
            condition,
          }
        ) => useConditionalDebounceValue(props)
      );

      // Initial value
      expect(result.current).toEqual(value1);

      rerender({ value: value2, delay, condition });
      // Still value1
      expect(result.current).toEqual(value1);

      act(() => {
        vi.advanceTimersByTime(delay - 1);
      });
      // Still value1
      expect(result.current).toEqual(value1);

      const value3 = "00000";
      rerender({ value: value3, delay, condition });
      // Immediately becomes value3
      expect(result.current).toEqual(value3);
    });
  });

  describe("`condition(value)` is `false`", () => {
    it("should not call `setTimeout` on mount, if `condition(value)` is false", () => {
      vi.spyOn(window, "setTimeout");

      renderHook(() =>
        useConditionalDebounceValue({
          value: "abcde",
          delay: 1000,
          condition: () => false,
        })
      );

      expect(setTimeout).toHaveBeenCalledTimes(0);
    });

    it("should not call `setTimeout` when `value changes, if `condition(value)` is false", () => {
      const delay = 1000;
      const condition = () => false;
      vi.spyOn(window, "setTimeout");

      const { rerender } = renderHook(
        (
          props: UseConditionalDebounceValueProps<unknown> = {
            value: "abcde",
            delay,
            condition,
          }
        ) => useConditionalDebounceValue(props)
      );

      expect(setTimeout).toHaveBeenCalledTimes(0);

      rerender({ value: "12345", delay, condition });

      expect(setTimeout).toHaveBeenCalledTimes(0);
    });

    test("when `condition(value)` changes to `true`, `setTimeout` should be called", () => {
      const delay = 1000;
      const condition = (v: string) => v === "abcde";
      vi.spyOn(window, "setTimeout");

      const { rerender } = renderHook(
        (
          props: UseConditionalDebounceValueProps<string> = {
            value: "12345",
            delay,
            condition,
          }
        ) => useConditionalDebounceValue(props)
      );

      expect(setTimeout).toHaveBeenCalledTimes(0);

      rerender({ value: "abcde", delay, condition });

      expect(setTimeout).toHaveBeenCalledTimes(1);
    });

    test("when `value` changes, the new value should be returned immediately", () => {
      const value1 = "abcde";
      const delay = 1000;
      const condition = () => false;

      const { result, rerender } = renderHook(
        (
          props: UseConditionalDebounceValueProps<string> = {
            value: value1,
            delay,
            condition,
          }
        ) => useConditionalDebounceValue(props)
      );

      // Initial value
      expect(result.current).toEqual(value1);

      const value2 = "12345";
      rerender({ value: value2, delay, condition });
      // Immediately becomes value2
      expect(result.current).toEqual(value2);

      const value3 = "00000";
      rerender({ value: value3, delay, condition });
      // Immediately becomes value3
      expect(result.current).toEqual(value3);
    });

    test("when `condition(value)` changes to `true`, the old value should still be returned for `delay` ms", () => {
      const value1 = "abcde";
      const value2 = "12345";
      const value3 = "00000";
      const delay = 1000;
      const condition = (v: string) => v === value2 || v === value3;

      const { result, rerender } = renderHook(
        (
          props: UseConditionalDebounceValueProps<string> = {
            value: value1,
            delay,
            condition,
          }
        ) => useConditionalDebounceValue(props)
      );

      // Initial value
      expect(result.current).toEqual(value1);

      rerender({ value: value2, delay, condition });
      // Still value1, since value2 is debounced
      expect(result.current).toEqual(value1);

      act(() => {
        vi.advanceTimersByTime(delay - 1);
      });
      // Still value1
      expect(result.current).toEqual(value1);

      rerender({ value: value3, delay, condition });
      // Still value1, since value3 is debounced
      expect(result.current).toEqual(value1);

      act(() => {
        vi.advanceTimersByTime(delay);
      });
      // Now value3 (value2 was skipped)
      expect(result.current).toEqual(value3);
    });
  });
});
