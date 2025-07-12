import { describe, expect, it } from "vitest";
import { mouseButtonsHeld } from "./mouse-buttons-held";
import { MouseButtonFlags } from "../constants/mouse-buttons";

describe("mouseButtonsHeld", () => {
  it("should return false if any specified buttons are not held", () => {
    expect(mouseButtonsHeld(0, MouseButtonFlags.left)).toEqual(false);
    expect(mouseButtonsHeld(1, MouseButtonFlags.right)).toEqual(false);
    expect(
      mouseButtonsHeld(1, MouseButtonFlags.left, MouseButtonFlags.right)
    ).toEqual(false);
  });

  it("should return true if all specified buttons are held", () => {
    expect(mouseButtonsHeld(1, MouseButtonFlags.left)).toEqual(true);
    expect(mouseButtonsHeld(2, MouseButtonFlags.right)).toEqual(true);
    expect(
      mouseButtonsHeld(3, MouseButtonFlags.left, MouseButtonFlags.right)
    ).toEqual(true);
  });

  it("should return true if no buttons are specified", () => {
    expect(mouseButtonsHeld(0)).toEqual(true);
    expect(mouseButtonsHeld(1)).toEqual(true);
    expect(mouseButtonsHeld(3)).toEqual(true);
    expect(mouseButtonsHeld(12345)).toEqual(true);
  });
});
