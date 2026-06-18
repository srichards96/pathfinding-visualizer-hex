import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./use-debounced-value";
import { renderHook } from "@testing-library/react";
import { act } from "react";

type UseDebouncedValueProps<T> = Parameters<typeof useDebouncedValue<T>>;

describe("useDebouncedValue", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  it("should set `debouncedValue` to first value", () => {
    const value = 1;

    const { result } = renderHook(
      (props: UseDebouncedValueProps<number> = [value, 200]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value);
  });

  it("should update `debouncedValue` after `delay` ms, when `value` changes", () => {
    const value1 = 1;
    const value2 = 2;
    const delay = 200;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, delay]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    // 0ms - not changed
    rerender([value2, delay]);
    expect(result.current).toBe(value1);

    // 199ms - not changed
    act(() => vi.advanceTimersByTime(delay - 1));
    expect(result.current).toBe(value1);

    // 200ms - changed
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(value2);
  });

  it("should reset delay (if pending) when `value` changes", () => {
    const value1 = 1;
    const value2 = 2;
    const value3 = 3;
    const delay = 200;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, delay]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    // 0ms - not changed
    rerender([value2, delay]);
    expect(result.current).toBe(value1);

    // 199ms - not changed
    act(() => vi.advanceTimersByTime(delay - 1));
    expect(result.current).toBe(value1);

    // Change again, reseting delay (0ms)
    rerender([value3, delay]);
    expect(result.current).toBe(value1);

    // 199ms - not changed
    act(() => vi.advanceTimersByTime(delay - 1));
    expect(result.current).toBe(value1);

    // 200ms - not changed
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(value3);
  });

  it("should reset delay (if pending) when `delay` changes to a non-null value", () => {
    const value1 = 1;
    const value2 = 2;
    const delay1 = 200;
    const delay2 = 500;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, delay1]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    // 0ms - not changed
    rerender([value2, delay1]);
    expect(result.current).toBe(value1);

    // 199ms - not changed
    act(() => vi.advanceTimersByTime(delay1 - 1));
    expect(result.current).toBe(value1);

    // Change delay, reseting delay (0ms)
    rerender([value2, delay2]);
    expect(result.current).toBe(value1);

    // 499ms - not changed
    act(() => vi.advanceTimersByTime(delay2 - 1));
    expect(result.current).toBe(value1);

    // 500ms - not changed
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(value2);
  });

  it("should update `debouncedValue` immediately when `value` changes, if `delay` is null", () => {
    const value1 = 1;
    const value2 = 2;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, null]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    // Change value while delay is null - should update immediately
    rerender([value2, null]);
    expect(result.current).toBe(value2);
  });

  it("should update `debouncedValue` immediately when `delay` changes, if `delay` is null", () => {
    const value1 = 1;
    const value2 = 2;

    const { result, rerender } = renderHook(
      (props: UseDebouncedValueProps<number> = [value1, 200]) =>
        useDebouncedValue(...props),
    );

    expect(result.current).toBe(value1);

    // Change value while delay is not null - should not update
    rerender([value2, 200]);
    expect(result.current).toBe(value1);

    // Change delay to null - should update immediately
    rerender([value2, null]);
    expect(result.current).toBe(value2);
  });
});
