import { HexGridWideRowTypes } from "./constants/hex/hex-grid-wide-row-types";
import { HexGridPosition } from "./types/hex-grid-position";
import { mouseButtonsHeld } from "./util/mouse-buttons-held";
import { MouseButtonFlags } from "./constants/mouse-buttons";
import { HexGridCellType } from "./types/hex-grid-cell-type";
import { HexGrid } from "./components/hex-grid";
import { useCallback, useState, MouseEvent, useMemo } from "react";
import { calculateHexCellSizingData } from "./util/hex/calculate-hex-cell-sizing-data";
import {
  OptionsForm,
  PathfindingVisualerFormValues,
} from "./components/options-form";
import { calculateHexGridPathfind } from "./util/hex/calculate-hex-grid-pathfind";
import { produce } from "immer";
import { Menu, X } from "lucide-react";
import { AnimationControls } from "./components/animation-controls";
import { useHexGrid } from "./hooks/use-hex-grid";
import { usePathfindingAnimation } from "./hooks/use-pathfinding-animation";

const wideRows = HexGridWideRowTypes.Even;
const animateSpeed = 1000; // How long css animations are when animating pathfind

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [start, setStart] = useState<HexGridPosition>();
  const [target, setTarget] = useState<HexGridPosition>();

  const [formValues, setFormValues] = useState<PathfindingVisualerFormValues>({
    cellSize: 30,
    cellSpacing: 2,
    animationSpeed: 200,
    cellPaintbrush: {
      type: "wall",
    },
    algorithm: "breadthFirstSearch",
  });

  const hexCellSizingData = useMemo(() => {
    return calculateHexCellSizingData({
      sideLength: formValues.cellSize,
      spacing: formValues.cellSpacing,
    });
  }, [formValues.cellSize, formValues.cellSpacing]);

  const { hexGrid, setHexGrid, gridContainerRef } = useHexGrid({
    wideRows,
    hexCellSizingData,
  });

  const {
    showPathfindingAnimated,
    showPathfinding,
    skipPathfindingAnimation,
    clearPathfinding,
    pathfindingAnimationsHaveRan,
    pathfindingAnimationIsRunning,
  } = usePathfindingAnimation({
    animationSpeed: formValues.animationSpeed,
    setHexGrid,
  });

  // const clearPathfind = useCallback(() => {
  //   for (const handle of timeoutHandles) {
  //     clearTimeout(handle);
  //   }

  //   setHexGrid((draft) => {
  //     for (const row of draft) {
  //       for (const cell of row) {
  //         cell.visited = false;
  //         cell.onPath = false;
  //       }
  //     }
  //   });

  //   setHasRun(false);
  //   setIsRunningAnimation(false);
  //   setTimeoutHandles([]);
  // }, [timeoutHandles, setHexGrid]);

  // Applies pathfind to grid immediately
  // const applyPathfind = useCallback(
  //   ({ cellsTraversed, cellsOnPath }: HexGridPathfindingResult) => {
  //     setHasRun(true);

  //     setHexGrid((draft) => {
  //       for (const { x, y } of cellsTraversed) {
  //         draft[y][x].visited = true;
  //       }
  //     });

  //     setHexGrid((draft) => {
  //       if (cellsOnPath === undefined) {
  //         return;
  //       }

  //       for (const { x, y } of cellsOnPath) {
  //         draft[y][x].onPath = true;
  //       }
  //     });
  //   },
  //   [setHexGrid]
  // );

  // Applies pathfind to grid over time, with each step having a delay
  // function applyPathfindWithAnimation({
  //   cellsTraversed,
  //   cellsOnPath,
  // }: HexGridPathfindingResult) {
  //   setIsRunningAnimation(true);
  //   setHasRun(true);

  //   const handles = [];

  //   // How long it takes for all cellsTravered timeouts to resolve
  //   const pathTimeoutOffset = cellsTraversed.length * formValues.animationSpeed;
  //   // How long it takes for all timeouts to resolve
  //   const endTimeoutOffset =
  //     (cellsTraversed.length + (cellsOnPath?.length ?? 0)) *
  //     formValues.animationSpeed;

  //   for (let i = 0; i < cellsTraversed.length; i++) {
  //     const { x: stepX, y: stepY } = cellsTraversed[i];

  //     const handle = setTimeout(() => {
  //       setHexGrid((draft) => {
  //         draft[stepY][stepX].visited = true;
  //         return draft;
  //       });
  //     }, i * formValues.animationSpeed);
  //     handles.push(handle);
  //   }

  //   if (cellsOnPath !== undefined) {
  //     for (let i = 0; i < cellsOnPath.length; i++) {
  //       const { x: stepX, y: stepY } = cellsOnPath[i];

  //       const handle = setTimeout(() => {
  //         setHexGrid((draft) => {
  //           draft[stepY][stepX].onPath = true;
  //           return draft;
  //         });
  //       }, pathTimeoutOffset + i * formValues.animationSpeed);
  //       handles.push(handle);
  //     }
  //   }

  //   // Allow time for last cell animation...
  //   const handle = setTimeout(() => {
  //     setIsRunningAnimation(false);
  //   }, endTimeoutOffset + animateSpeed);
  //   handles.push(handle);

  //   setTimeoutHandles(handles);
  // }

  // Handler for both cell MouseDown and MouseEnter events...
  const onCellMouseEvent = useCallback(
    (e: MouseEvent, cell: HexGridCellType) => {
      if (pathfindingAnimationIsRunning) {
        return;
      }

      let nextGrid = hexGrid;
      let nextStart = start;
      let nextTarget = target;

      const { x, y } = cell;
      if (mouseButtonsHeld(e.buttons, MouseButtonFlags.left)) {
        switch (formValues.cellPaintbrush.type) {
          case "start":
            nextStart = { x, y };
            break;
          case "target":
            nextTarget = { x, y };
            break;
          case "empty":
            nextGrid = produce(hexGrid, (draft) => {
              draft[y][x].weight = 1;
              draft[y][x].wall = false;
            });
            break;
          case "wall":
            nextGrid = produce(hexGrid, (draft) => {
              draft[y][x].weight = 1;
              draft[y][x].wall = true;
            });
            break;
          case "weighted": {
            const weight = formValues.cellPaintbrush.weight;
            nextGrid = produce(hexGrid, (draft) => {
              draft[y][x].weight = weight;
              draft[y][x].wall = false;
            });
            break;
          }
        }
      } else if (mouseButtonsHeld(e.buttons, MouseButtonFlags.right)) {
        // Clear start position if selected
        if (x === start?.x && y === start.y) {
          nextStart = undefined;
        }
        // Clear target position if selected
        if (x === target?.x && y === target.y) {
          nextTarget = undefined;
        }
        // Clear weight/wall state
        nextGrid = produce(hexGrid, (draft) => {
          draft[y][x].weight = 1;
          draft[y][x].wall = false;
        });
      }

      setStart(nextStart);
      setTarget(nextTarget);
      setHexGrid(nextGrid);

      if (pathfindingAnimationsHaveRan) {
        const pathfind = calculateHexGridPathfind({
          grid: nextGrid,
          start: nextStart,
          target: nextTarget,
          algorithmName: formValues.algorithm,
          wideRows,
        });

        if (pathfind !== undefined) {
          showPathfinding(pathfind);
        }
      }
    },
    [
      setHexGrid,
      hexGrid,
      start,
      target,
      formValues,
      pathfindingAnimationIsRunning,
      pathfindingAnimationsHaveRan,
      showPathfinding,
    ]
  );

  function onAnimatePathfindButtonClicked() {
    if (pathfindingAnimationIsRunning) {
      return;
    }

    const pathfindResult = calculateHexGridPathfind({
      grid: hexGrid,
      start: start,
      target: target,
      algorithmName: formValues.algorithm,
      wideRows,
    });

    if (pathfindResult !== undefined) {
      showPathfindingAnimated(pathfindResult);
    }
  }

  return (
    <main className="flex h-screen relative">
      <div
        className="flex-shrink-0 w-full md:w-[320px] overflow-y-auto bg-gray-800 text-white p-4 space-y-4 absolute z-10 inset-y-0 data-[open=false]:left-[-100%] data-[open=false]:opacity-0 data-[open=true]:left-0 data-[open=true]:opacity-100 transition-all md:relative md:!left-0 md:!opacity-100"
        data-open={menuOpen}
      >
        <button
          type="button"
          className="absolute right-2 top-2 p-2 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <X />
        </button>

        <div className="hidden md:block space-y-4">
          <h2 className="text-2xl">Controls:</h2>
          <AnimationControls
            isAnimationRunning={pathfindingAnimationIsRunning}
            hasAnimationRan={pathfindingAnimationsHaveRan}
            animateFn={onAnimatePathfindButtonClicked}
            skipAnimationFn={skipPathfindingAnimation}
            clearAnimationFn={clearPathfinding}
          />
        </div>

        <OptionsForm defaultValues={formValues} onSubmit={setFormValues} />
      </div>

      <div className="flex grow flex-col">
        <div className="shrink-0 bg-gray-800 text-white p-2 flex items-center gap-4">
          <button
            type="button"
            className="md:hidden p-2"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold">
            Pathfinding Visualizer Hex
          </h1>
        </div>

        <HexGrid
          ref={gridContainerRef}
          grid={hexGrid}
          wideRows={wideRows}
          hexCellSizingData={hexCellSizingData}
          startPosition={start}
          targetPosition={target}
          isRunningAnimation={pathfindingAnimationIsRunning}
          animationSpeed={animateSpeed}
          onCellMouseDown={onCellMouseEvent}
          onCellMouseEnter={onCellMouseEvent}
        />

        <div className="shrink-0 bg-gray-800 text-white p-2 flex items-center gap-4 md:hidden">
          <AnimationControls
            isAnimationRunning={pathfindingAnimationIsRunning}
            hasAnimationRan={pathfindingAnimationsHaveRan}
            animateFn={onAnimatePathfindButtonClicked}
            skipAnimationFn={skipPathfindingAnimation}
            clearAnimationFn={clearPathfinding}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
