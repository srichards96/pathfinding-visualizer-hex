import { useEffect, useRef } from "react";
import { HexGridWideRowType } from "../constants/hex/hex-grid-wide-row-types";
import { useImmer } from "use-immer";
import { makeHexGrid } from "../util/hex/make-hex-grid";
import { resizeHexGridToFitContainer } from "../util/hex/resize-hex-grid-to-fit-container";
import { HexGridCellSizingData } from "../types/hex-grid-cell-sizing-data";

type Props = {
  wideRows: HexGridWideRowType;
  hexCellSizingData: HexGridCellSizingData;
};

export function useHexGrid({ wideRows, hexCellSizingData }: Props) {
  const [hexGrid, setHexGrid] = useImmer(
    makeHexGrid({
      rows: 0,
      cols: 0,
      wideRows,
    })
  );

  const gridContainerRef = useRef<HTMLDivElement>(null);

  // On load, and when cell sizing changes, resize grid to fit available space...
  useEffect(() => {
    const gridContainerElement = gridContainerRef.current;

    if (gridContainerElement == null) {
      return;
    }

    setHexGrid((draft) =>
      resizeHexGridToFitContainer({
        grid: draft,
        element: gridContainerElement,
        hexCellSizingData,
        wideRows,
      })
    );
  }, [wideRows, hexCellSizingData, setHexGrid]);

  // On window resize, and when cell sizing changes, resize grid to fit available space...
  useEffect(() => {
    function onResize() {
      const gridContainerElement = gridContainerRef.current;

      if (gridContainerElement !== null) {
        setHexGrid((draft) =>
          resizeHexGridToFitContainer({
            grid: draft,
            element: gridContainerElement,
            hexCellSizingData,
            wideRows,
          })
        );
      }
    }

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [wideRows, hexCellSizingData, setHexGrid]);

  return {
    hexGrid,
    setHexGrid,
    gridContainerRef,
  };
}
