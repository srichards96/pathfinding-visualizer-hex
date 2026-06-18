import { fireEvent, render, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHexGrid } from "./use-hex-grid";
import { calculateHexCellSizingData } from "../util/hex/calculate-hex-cell-sizing-data";
import {
  HexGridWideRowType,
  HexGridWideRowTypes,
} from "../constants/hex/hex-grid-wide-row-types";
import * as ResizeHexGridToFitContainerModule from "../util/hex/resize-hex-grid-to-fit-container";
import { HexGridCellSizingData } from "../types/hex-grid-cell-sizing-data";

type UseHexGridProps = {
  wideRows: HexGridWideRowType;
  hexCellSizingData: HexGridCellSizingData;
};

const wideRows = HexGridWideRowTypes.Even;
const hexCellSizingData = calculateHexCellSizingData({
  sideLength: 30,
  spacing: 2,
});
const hexCellSizingData2 = calculateHexCellSizingData({
  sideLength: 40,
  spacing: 3,
});

describe("useHexGrid", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("without `gridContainerRef` in use", () => {
    it("should initially not resize and produce an empty hex grid", () => {
      vi.spyOn(
        ResizeHexGridToFitContainerModule,
        "resizeHexGridToFitContainer",
      );

      renderHook(() => useHexGrid({ wideRows, hexCellSizingData }));

      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(0);
    });

    it("should not resize when `hexCellSizingData` changes", () => {
      vi.spyOn(
        ResizeHexGridToFitContainerModule,
        "resizeHexGridToFitContainer",
      );

      const { rerender } = renderHook(
        (
          props: UseHexGridProps = {
            wideRows,
            hexCellSizingData,
          },
        ) => useHexGrid(props),
      );

      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(0);

      rerender({ wideRows, hexCellSizingData: hexCellSizingData2 });

      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(0);
    });

    it("should not resize when `resize` events fire on the `window` object", () => {
      vi.spyOn(
        ResizeHexGridToFitContainerModule,
        "resizeHexGridToFitContainer",
      );

      renderHook(
        (
          props: UseHexGridProps = {
            wideRows,
            hexCellSizingData,
          },
        ) => useHexGrid(props),
      );

      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(0);

      fireEvent.resize(window);

      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(0);
    });
  });

  describe("with `gridContainerRef` in use", async () => {
    it("should initially resize and produce a hex grid that fits the element that `gridContainerRef` is attached to", () => {
      vi.spyOn(
        ResizeHexGridToFitContainerModule,
        "resizeHexGridToFitContainer",
      );

      const TestComponent = () => {
        const result = useHexGrid({ wideRows, hexCellSizingData });

        return <div ref={result.gridContainerRef} />;
      };

      render(<TestComponent />);

      // 1st render had ref attached, so effect to resize to container should've ran
      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(1);
    });

    it("should resize when `hexCellSizingData` changes", () => {
      vi.spyOn(
        ResizeHexGridToFitContainerModule,
        "resizeHexGridToFitContainer",
      );

      type TestComponentProps = {
        hexCellSizingData: HexGridCellSizingData;
      };
      const TestComponent = (props: TestComponentProps) => {
        const result = useHexGrid({
          wideRows,
          hexCellSizingData: props.hexCellSizingData,
        });

        return <div ref={result.gridContainerRef} />;
      };

      const { rerender } = render(
        <TestComponent hexCellSizingData={hexCellSizingData} />,
      );

      // 1st render had ref attached, so effect to resize to container should've ran
      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(1);

      rerender(<TestComponent hexCellSizingData={hexCellSizingData2} />);

      // hexCellSizingData changed, so effect to resize to container should've ran
      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(2);

      rerender(<TestComponent hexCellSizingData={hexCellSizingData2} />);

      // hexCellSizingData didn't change, so effect to resize to container shouldn't have ran
      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(2);
    });

    it("should resize when `resize` events fire on the `window` object", () => {
      vi.spyOn(
        ResizeHexGridToFitContainerModule,
        "resizeHexGridToFitContainer",
      );

      const TestComponent = () => {
        const result = useHexGrid({ wideRows, hexCellSizingData });

        return <div ref={result.gridContainerRef} />;
      };

      render(<TestComponent />);

      // 1st render had ref attached, so effect to resize to container should've ran
      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(1);

      fireEvent.resize(window);

      // Window had resize event, so effect to resize to container should've ran
      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(2);

      fireEvent.resize(window);

      // Window had resize event, so effect to resize to container should've ran
      expect(
        ResizeHexGridToFitContainerModule.resizeHexGridToFitContainer,
      ).toHaveBeenCalledTimes(3);
    });
  });
});
