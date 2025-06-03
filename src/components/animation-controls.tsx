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
    <div className="flex gap-2 md:justify-between">
      {!isAnimationRunning && (
        <button className="border rounded-sm px-4 py-2" onClick={animateFn}>
          Animate Pathfind
        </button>
      )}
      {isAnimationRunning && (
        <>
          <button
            className="border rounded-sm px-4 py-2"
            onClick={skipAnimationFn}
          >
            Skip
          </button>
          <button
            className="border rounded-sm px-4 py-2"
            onClick={clearAnimationFn}
          >
            Cancel
          </button>
        </>
      )}

      {hasAnimationRan && !isAnimationRunning && (
        <button
          className="border rounded-sm px-4 py-2"
          disabled={isAnimationRunning}
          onClick={clearAnimationFn}
        >
          Reset
        </button>
      )}
    </div>
  );
}
