import { renderHook } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { usePathfindingAnimation } from "./use-pathfinding-animation";
import { act } from "react";
import { HexGridPathfindingResult } from "../types/hex-grid-pathfinding-result";

const animationSpeed = 50;
const pathfindingResult = {
  cellsTraversed: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 },
    { x: 5, y: 5 },
  ],
  cellsOnPath: [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 },
    { x: 5, y: 5 },
  ],
} satisfies HexGridPathfindingResult;

describe("usePathfindingAnimation", () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe("`pathfindingAnimationsHaveRan`", () => {
    it("should initially be `false", () => {
      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid: vi.fn() })
      );

      expect(result.current.pathfindingAnimationsHaveRan).toEqual(false);
    });

    it("should be set to `true` when `showPathfindingAnimated` is called", () => {
      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid: vi.fn() })
      );

      act(() => {
        result.current.showPathfindingAnimated(pathfindingResult);
      });

      expect(result.current.pathfindingAnimationsHaveRan).toEqual(true);
    });

    it("should be set to `true` when `showPathfinding` is called", () => {
      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid: vi.fn() })
      );

      act(() => {
        result.current.showPathfinding(pathfindingResult);
      });

      expect(result.current.pathfindingAnimationsHaveRan).toEqual(true);
    });

    it("should be set to `false` when `clearPathfinding` is called", () => {
      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid: vi.fn() })
      );

      act(() => {
        result.current.showPathfindingAnimated(pathfindingResult);
      });
      // Should've set it to true
      expect(result.current.pathfindingAnimationsHaveRan).toEqual(true);

      act(() => {
        result.current.clearPathfinding();
      });

      // Should've set it to false
      expect(result.current.pathfindingAnimationsHaveRan).toEqual(false);
    });
  });

  describe("`pathfindingAnimationIsRunning", () => {
    it("should initially be `false", () => {
      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid: vi.fn() })
      );

      expect(result.current.pathfindingAnimationIsRunning).toEqual(false);
    });

    it("should be set to `true` while steps are being animated", () => {
      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid: vi.fn() })
      );

      // Initially no steps to animate, so should be false
      expect(result.current.pathfindingAnimationIsRunning).toEqual(false);

      // Are now steps to animate, so should be true
      act(() => {
        result.current.showPathfindingAnimated(pathfindingResult);
      });
      expect(result.current.pathfindingAnimationIsRunning).toEqual(true);

      const traversalSteps = pathfindingResult.cellsTraversed.length;
      const pathSteps = pathfindingResult.cellsOnPath.length;

      // Midway through animating steps, so should still be true
      act(() => {
        vi.advanceTimersByTime(traversalSteps * animationSpeed);
      });
      expect(result.current.pathfindingAnimationIsRunning).toEqual(true);

      // All steps completed, so should be false
      act(() => {
        vi.advanceTimersByTime(pathSteps * animationSpeed);
      });
      expect(result.current.pathfindingAnimationIsRunning).toEqual(false);
    });

    it("should be set to `false` after `clearPathfinding` has been called", () => {
      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid: vi.fn() })
      );

      // Initially no steps to animate, so should be false
      expect(result.current.pathfindingAnimationIsRunning).toEqual(false);

      // Are now steps to animate, so should be true
      act(() => {
        result.current.showPathfindingAnimated(pathfindingResult);
      });
      expect(result.current.pathfindingAnimationIsRunning).toEqual(true);

      // Steps were cleared, so should be false
      act(() => {
        result.current.clearPathfinding();
      });
      expect(result.current.pathfindingAnimationIsRunning).toEqual(false);
    });
  });

  describe("after `showPathfindingAnimated` is called", () => {
    it("should not initially call `setHexGrid`", () => {
      const setHexGrid = vi.fn();

      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid })
      );

      // Initially not called
      expect(setHexGrid).toHaveBeenCalledTimes(0);

      act(() => {
        result.current.showPathfindingAnimated(pathfindingResult);
      });

      // Not called prior to animationSpeed ms
      expect(setHexGrid).toHaveBeenCalledTimes(0);
    });

    it("should call `setHexGrid` in an interval for each traversal/path step", () => {
      const setHexGrid = vi.fn();

      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid })
      );

      // Initially not called
      expect(setHexGrid).toHaveBeenCalledTimes(0);

      act(() => {
        result.current.showPathfindingAnimated(pathfindingResult);
      });

      // Not called prior to animationSpeed ms
      act(() => {
        vi.advanceTimersByTime(animationSpeed - 1);
      });
      expect(setHexGrid).toHaveBeenCalledTimes(0);

      // Called after animationSpeed ms
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(setHexGrid).toHaveBeenCalledTimes(1);

      // Called 2 times after animationSpeed * 2 ms
      act(() => {
        vi.advanceTimersByTime(animationSpeed);
      });
      expect(setHexGrid).toHaveBeenCalledTimes(2);
    });

    it("should stop calling `setHexGrid` in an interval when all traversal/path steps have been completed", () => {
      const setHexGrid = vi.fn();

      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid })
      );

      // Initially not called
      expect(setHexGrid).toHaveBeenCalledTimes(0);

      act(() => {
        result.current.showPathfindingAnimated(pathfindingResult);
      });

      // Still not called
      expect(setHexGrid).toHaveBeenCalledTimes(0);

      const traversalSteps = pathfindingResult.cellsTraversed.length;
      const pathSteps = pathfindingResult.cellsOnPath.length;

      // After traversalSteps * animationSpeed ms, setHexGrid should've been called traversalSteps times
      act(() => {
        vi.advanceTimersByTime(animationSpeed * traversalSteps);
      });
      expect(setHexGrid).toHaveBeenCalledTimes(traversalSteps);

      // After (traversalSteps + pathStep) * animationSpeed ms,
      //   setHexGrid should've been called (traversalSteps + pathSteps) times
      act(() => {
        vi.advanceTimersByTime(animationSpeed * pathSteps);
      });
      expect(setHexGrid).toHaveBeenCalledTimes(traversalSteps + pathSteps);

      // After all traversal/path steps have been processed, setHexGrid shouldn't be called after any amount of time
      act(() => {
        vi.advanceTimersByTime(animationSpeed * 10);
      });
      expect(setHexGrid).toHaveBeenCalledTimes(traversalSteps + pathSteps);
    });

    it("should stop calling `setHexGrid` in an interval and run it 1 time after `skipPathfindingAnimation` is called", () => {
      const setHexGrid = vi.fn();

      const { result } = renderHook(() =>
        usePathfindingAnimation({ animationSpeed, setHexGrid })
      );

      // Initially not called
      expect(setHexGrid).toHaveBeenCalledTimes(0);

      act(() => {
        result.current.showPathfindingAnimated(pathfindingResult);
      });

      // After 3 * animationSpeed ms, setHexGrid should've been called 3 times
      act(() => {
        vi.advanceTimersByTime(animationSpeed * 3);
      });
      expect(setHexGrid).toHaveBeenCalledTimes(3);

      // Calling skipPathfindingAnimation should result in setHexGrid being called 1 more time
      act(() => {
        result.current.skipPathfindingAnimation();
      });
      expect(setHexGrid).toHaveBeenCalledTimes(4);

      // After skipPathfindingAnimation was called, setHexGrid shouldn't be called after any amount of time
      act(() => {
        vi.advanceTimersByTime(animationSpeed * 10);
      });
      expect(setHexGrid).toHaveBeenCalledTimes(4);
    });
  });

  it("should call `setHexGrid` 1 time after `showPathfinding` is called", () => {
    const setHexGrid = vi.fn();

    const { result } = renderHook(() =>
      usePathfindingAnimation({ animationSpeed, setHexGrid })
    );

    expect(setHexGrid).toHaveBeenCalledTimes(0);

    act(() => {
      result.current.showPathfinding(pathfindingResult);
    });

    expect(setHexGrid).toHaveBeenCalledTimes(1);
  });
});
