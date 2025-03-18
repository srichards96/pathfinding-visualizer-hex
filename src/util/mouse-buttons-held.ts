import { MouseButtonFlag } from "../constants/mouse-buttons";
import { MouseEvent } from "react";

export function mouseButtonsHeld(
  e: MouseEvent,
  ...buttonFlags: MouseButtonFlag[]
) {
  for (const flag of buttonFlags) {
    if ((e.buttons & flag) !== flag) {
      return false;
    }
  }
  return true;
}
