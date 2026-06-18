import { describe, expect, it, vi } from "vitest";
import { useOnValueChange } from "./use-on-value-change";
import { renderHook } from "@testing-library/react";

type UseOnValueChangeProps<T> = Parameters<typeof useOnValueChange<T>>;

type Obj = { value: number };

describe("useOnValueChange", () => {
  it('should not run callback on first render (first value is considered "unchanged")', () => {
    const callback = vi.fn();

    expect(callback).toHaveBeenCalledTimes(0);

    renderHook((props: UseOnValueChangeProps<number> = [1, callback]) =>
      useOnValueChange(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);
  });

  it("should run callback when `value` changes", () => {
    const callback = vi.fn();

    expect(callback).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<number> = [1, callback]) =>
        useOnValueChange(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    // Rerender with different value - should call callback
    rerender([2, callback]);
    expect(callback).toHaveBeenCalledTimes(1);

    // Rerender with same value - shouldn't call callback
    rerender([2, callback]);
    expect(callback).toHaveBeenCalledTimes(1);

    // Rerender with different value - should call callback
    rerender([3, callback]);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("should not run callback when `callback` changes", () => {
    const value = 1;
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<number> = [value, callback1]) =>
        useOnValueChange(...props),
    );

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);

    rerender([value, callback2]);

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);
  });

  it("should run latest `callback` when both `value` and `callback` change at same time", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<number> = [1, callback1]) =>
        useOnValueChange(...props),
    );

    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(0);

    // Only the new callback (callback2) should be called
    rerender([2, callback2]);
    expect(callback1).toHaveBeenCalledTimes(0);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("should pass the old and new values as parameters to `callback`", () => {
    const value1 = 1;
    const value2 = 2;
    const callback = vi.fn();

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<number> = [value1, callback]) =>
        useOnValueChange(...props),
    );

    rerender([value2, callback]);
    expect(callback).toHaveBeenLastCalledWith(value1, value2);

    rerender([value1, callback]);
    expect(callback).toHaveBeenLastCalledWith(value2, value1);
  });

  it("should work with object types with stable references", () => {
    const value1: Obj = { value: 1 };
    const value2: Obj = { value: 2 };
    const callback = vi.fn();

    expect(callback).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (props: UseOnValueChangeProps<Obj> = [value1, callback]) =>
        useOnValueChange(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    // Rerender with same reference for value - should not call callback
    rerender([value1, callback]);
    expect(callback).toHaveBeenCalledTimes(0);

    // Rerender with different value - should call callback
    rerender([value2, callback]);
    expect(callback).toHaveBeenCalledTimes(1);

    // Rerender with same value but different reference - should call callback
    rerender([{ ...value2 }, callback]);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("should work with object types with unstable references if `compareFn` is provided", () => {
    const callback = vi.fn();
    const compareFn = (a: Obj, b: Obj) => a.value === b.value;

    expect(callback).toHaveBeenCalledTimes(0);

    const { rerender } = renderHook(
      (
        props: UseOnValueChangeProps<Obj> = [{ value: 1 }, callback, compareFn],
      ) => useOnValueChange(...props),
    );

    expect(callback).toHaveBeenCalledTimes(0);

    // Rerender with same value but different reference - should not call callback
    rerender([{ value: 1 }, callback, compareFn]);
    expect(callback).toHaveBeenCalledTimes(0);

    // Rerender with different value - should call callback
    rerender([{ value: 2 }, callback, compareFn]);
    expect(callback).toHaveBeenCalledTimes(1);

    // Rerender with same value but different reference - should not call callback
    rerender([{ value: 2 }, callback, compareFn]);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
