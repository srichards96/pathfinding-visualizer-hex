import { Button } from "./button";

type Props = {
  isAnimationRunning: boolean;
  hasAnimationRan: boolean;
  animateFn: () => void;
  skipAnimationFn: () => void;
  clearAnimationFn: () => void;
};

export function AnimationControls({
  isAnimationRunning,
  hasAnimationRan,
  animateFn,
  skipAnimationFn,
  clearAnimationFn,
}: Props) {
  return (
    <div className="flex gap-2 grow justify-between">
      {!isAnimationRunning && (
        <Button onClick={animateFn}>Animate Pathfind</Button>
      )}
      {isAnimationRunning && (
        <>
          <Button onClick={skipAnimationFn}>Skip to End</Button>
          <Button variant="secondary" onClick={clearAnimationFn}>
            Cancel
          </Button>
        </>
      )}

      {hasAnimationRan && !isAnimationRunning && (
        <Button
          variant="secondary"
          disabled={isAnimationRunning}
          onClick={clearAnimationFn}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
