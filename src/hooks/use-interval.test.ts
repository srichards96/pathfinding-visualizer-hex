import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { renderHook } from "@testing-library/react";
import { useInterval } from "./use-interval";

type UseIntervalProps = {
  callback: () => void;
  delay: number | null;
};

describe("useInterval", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });
  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should set up an interval on mount if `delay` is not null", () => {
    vi.spyOn(window, "setInterval");

    renderHook((props: UseIntervalProps = { callback: vi.fn(), delay: 1000 }) =>
      useInterval(props.callback, props.delay),
    );

    expect(setInterval).toHaveBeenCalledTimes(1);
  });

  it("should not set up an interval on mount if `delay` is null", () => {
    vi.spyOn(window, "setInterval");

    renderHook((props: UseIntervalProps = { callback: vi.fn(), delay: null }) =>
      useInterval(props.callback, props.delay),
    );

    expect(setInterval).toHaveBeenCalledTimes(0);
  });

  it("should clear the previous interval if `delay` changes", () => {
    const callback = vi.fn();
    vi.spyOn(window, "clearInterval");

    const { rerender } = renderHook(
      (props: UseIntervalProps = { callback, delay: 1000 }) =>
        useInterval(props.callback, props.delay),
    );

    expect(clearInterval).toHaveBeenCalledTimes(0);

    rerender({ callback, delay: null });

    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  it("should set up a new interval if `delay` changes to a non-null value", () => {
    const callback = vi.fn();
    vi.spyOn(window, "setInterval");
    vi.spyOn(window, "clearInterval");

    const { rerender } = renderHook(
      (props: UseIntervalProps = { callback, delay: 1000 }) =>
        useInterval(props.callback, props.delay),
    );

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(clearInterval).toHaveBeenCalledTimes(0);

    rerender({ callback, delay: 500 });

    expect(setInterval).toHaveBeenCalledTimes(2);
    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  it("should not set up a new interval if `delay` changes to null", () => {
    const callback = vi.fn();
    vi.spyOn(window, "setInterval");
    vi.spyOn(window, "clearInterval");

    const { rerender } = renderHook(
      (props: UseIntervalProps = { callback, delay: 1000 }) =>
        useInterval(props.callback, props.delay),
    );

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(clearInterval).toHaveBeenCalledTimes(0);

    rerender({ callback, delay: null });

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  it("should not clear the previous interval or set up a new interval when `callback` changes", () => {
    const delay = 1000;
    vi.spyOn(window, "setInterval");
    vi.spyOn(window, "clearInterval");

    const { rerender } = renderHook(
      (props: UseIntervalProps = { callback: vi.fn(), delay }) =>
        useInterval(props.callback, props.delay),
    );

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(clearInterval).toHaveBeenCalledTimes(0);

    rerender({ callback: vi.fn(), delay });

    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(clearInterval).toHaveBeenCalledTimes(0);
  });

  it("should run the `callback` after `delay` ms, if `delay` is not null", () => {
    const callback = vi.fn();

    const { rerender } = renderHook(
      (props: UseIntervalProps = { callback, delay: 1000 }) =>
        useInterval(props.callback, props.delay),
    );

    // Should have ran 0 times initially
    expect(callback).toHaveBeenCalledTimes(0);

    // Should have still ran 0 times after less than delay ms
    vi.advanceTimersByTime(999);
    expect(callback).toHaveBeenCalledTimes(0);

    // Should have ran 1 time after exactly delay ms
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);

    // Should have still ran 1 time between delay ms and delay * 2 ms
    vi.advanceTimersByTime(700);
    expect(callback).toHaveBeenCalledTimes(1);

    // Intervals should now be relative to this point (1700ms)
    rerender({ callback, delay: 500 });

    // Rerender shouldn't call callback
    expect(callback).toHaveBeenCalledTimes(1);

    // 2000 total ms. Shouldn't have ran a second time since delay is now 500 ms relative to 1700ms
    // So should run after 2200 total ms
    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);

    // 2200 total ms. Should now have ran a second time
    vi.advanceTimersByTime(200);
    expect(callback).toHaveBeenCalledTimes(2);

    // After delay * 10 ms, callback should have been called another 10 times
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(12);
  });
});
