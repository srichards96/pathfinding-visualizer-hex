import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useCounter } from "./use-counter";
import { act } from "react";

describe("useCounter", () => {
  test("the first `value` should be the `initialValue`", () => {
    const expectedInitialValue = 10;

    const { result } = renderHook(
      (initialValue: number = expectedInitialValue) => useCounter(initialValue)
    );

    expect(result.current.value).toEqual(expectedInitialValue);
  });

  test("`initialValue` should be optional and default to `0` if omitted", () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.value).toEqual(0);
  });

  test("calling `increment` should increase `value` by 1", () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.value).toEqual(0);

    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toEqual(1);

    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toEqual(2);

    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toEqual(3);
  });

  test("calling `decrement` should decrease `value` by 1", () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.value).toEqual(0);

    act(() => {
      result.current.decrement();
    });
    expect(result.current.value).toEqual(-1);

    act(() => {
      result.current.decrement();
    });
    expect(result.current.value).toEqual(-2);

    act(() => {
      result.current.decrement();
    });
    expect(result.current.value).toEqual(-3);
  });

  test("calling `reset` should change `value` to the `initialValue`", () => {
    const initialValue = 10;
    const { result } = renderHook(() => useCounter(initialValue));

    expect(result.current.value).toEqual(initialValue);

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });
    expect(result.current.value).toEqual(initialValue + 3);

    act(() => {
      result.current.reset();
    });
    expect(result.current.value).toEqual(initialValue);
  });

  test("calling `setValue` with a number `n` should change `value` to `n`", () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.value).toEqual(0);

    act(() => {
      result.current.setValue(10);
    });
    expect(result.current.value).toEqual(10);
  });
});
