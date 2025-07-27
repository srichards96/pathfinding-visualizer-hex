import { useCallback, useState } from "react";
import { HexGridPathfindingResult } from "../types/hex-grid-pathfinding-result";
import { useCounter } from "./use-counter";
import { useInterval } from "./use-interval";
import { HexGridCellType } from "../types/hex-grid-cell-type";
import { Updater } from "use-immer";

type Props = {
  animationSpeed: number;
  setHexGrid: Updater<HexGridCellType[][]>;
};

export function usePathfindingAnimation({ animationSpeed, setHexGrid }: Props) {
  const [animationSteps, setAnimationSteps] =
    useState<HexGridPathfindingResult>();
  const [pathfindingAnimationsHaveRan, setPathfindingAnimationsHaveRan] =
    useState(false);

  // Represents which number the current step of animation is (0-indexed)
  const traversalAnimationIndex = useCounter();
  const pathAnimationIndex = useCounter();

  // Whether the animations have steps remaining
  const traversalAnimationRunning =
    !!animationSteps &&
    traversalAnimationIndex.value < animationSteps.cellsTraversed.length;
  const pathAnimationRunning =
    !!animationSteps?.cellsOnPath &&
    pathAnimationIndex.value < animationSteps.cellsOnPath.length;

  // Animates traversal steps
  useInterval(
    () => {
      const { x, y } =
        animationSteps!.cellsTraversed[traversalAnimationIndex.value];

      setHexGrid((draft) => {
        draft[y][x].visited = true;
      });

      traversalAnimationIndex.increment(); // Eventually, this will cause the interval to stop
    },
    // While there are traversal steps left to animate
    traversalAnimationRunning ? animationSpeed : null
  );

  // Animates path steps
  useInterval(
    () => {
      const { x, y } = animationSteps!.cellsOnPath![pathAnimationIndex.value];

      setHexGrid((draft) => {
        draft[y][x].onPath = true;
      });

      pathAnimationIndex.increment(); // Eventually, this will cause the interval to stop
    },
    // After traversal animation has finished and while there are path steps left to animate
    !traversalAnimationRunning && pathAnimationRunning ? animationSpeed : null
  );

  /** Sets new pathfinding steps and animates them step-by-step */
  const showPathfindingAnimated = useCallback(
    (newAnimationSteps: HexGridPathfindingResult) => {
      setAnimationSteps(newAnimationSteps);
      setPathfindingAnimationsHaveRan(true);

      setHexGrid((draft) => {
        // Reset old state
        for (const row of draft) {
          for (const cell of row) {
            cell.visited = false;
            cell.onPath = false;
          }
        }
      });

      // Reset animation indices, so that the traversal/path are animated step-by-step
      traversalAnimationIndex.reset();
      pathAnimationIndex.reset();
    },
    [traversalAnimationIndex, pathAnimationIndex, setHexGrid]
  );

  /** Sets new pathfinding steps and shows them all immediately (no animation) */
  const showPathfinding = useCallback(
    (newAnimationSteps: HexGridPathfindingResult) => {
      setAnimationSteps(newAnimationSteps);
      setPathfindingAnimationsHaveRan(true);

      setHexGrid((draft) => {
        // Reset old state
        for (const row of draft) {
          for (const cell of row) {
            cell.visited = false;
            cell.onPath = false;
          }
        }

        // Apply all traversal steps...
        for (const { x, y } of newAnimationSteps.cellsTraversed) {
          draft[y][x].visited = true;
        }
        // Apply all path steps...
        for (const { x, y } of newAnimationSteps.cellsOnPath ?? []) {
          draft[y][x].onPath = true;
        }
      });

      // Set animation indices to final values, so that there are no steps remaining to animate
      traversalAnimationIndex.setValue(newAnimationSteps.cellsTraversed.length);
      pathAnimationIndex.setValue(newAnimationSteps.cellsOnPath?.length ?? 0);
    },
    [traversalAnimationIndex, pathAnimationIndex, setHexGrid]
  );

  const skipPathfindingAnimation = useCallback(() => {
    setHexGrid((draft) => {
      // Reset old state
      for (const row of draft) {
        for (const cell of row) {
          cell.visited = false;
          cell.onPath = false;
        }
      }

      // Apply all traversal steps...
      for (const { x, y } of animationSteps?.cellsTraversed ?? []) {
        draft[y][x].visited = true;
      }
      // Apply all path steps...
      for (const { x, y } of animationSteps?.cellsOnPath ?? []) {
        draft[y][x].onPath = true;
      }
    });

    // Set animation indices to final values, so that there are no steps remaining to animate
    traversalAnimationIndex.setValue(
      animationSteps?.cellsTraversed.length ?? 0
    );
    pathAnimationIndex.setValue(animationSteps?.cellsOnPath?.length ?? 0);
  }, [animationSteps, traversalAnimationIndex, pathAnimationIndex, setHexGrid]);

  const clearPathfinding = useCallback(() => {
    setAnimationSteps(undefined);
    setPathfindingAnimationsHaveRan(false);

    setHexGrid((draft) => {
      // Reset old state
      for (const row of draft) {
        for (const cell of row) {
          cell.visited = false;
          cell.onPath = false;
        }
      }
    });

    traversalAnimationIndex.reset();
    pathAnimationIndex.reset();
  }, [setHexGrid, traversalAnimationIndex, pathAnimationIndex]);

  return {
    /** Renders pathfinding steps step-by-step in an animation */
    showPathfindingAnimated,
    /** Renders all pathfinding steps immediately (without animation) */
    showPathfinding,
    /** Stops animations and renders all pathfinding steps immediately */
    skipPathfindingAnimation,
    /** Stops animations and clears all pathfinding steps */
    clearPathfinding,
    /**
     * Whether the current animations have ever ran (partially or completely).
     *
     * Starts as `false`.
     *
     * Becomes `true` when `showPathfindingAnimated` or `showPathfinding` are called.
     *
     * Becomes `false` when `clearPathfinding` is called.
     **/
    pathfindingAnimationsHaveRan,
    /**
     * Whether the current animations are currently running.
     */
    pathfindingAnimationIsRunning:
      traversalAnimationRunning || pathAnimationRunning,
  };
}
