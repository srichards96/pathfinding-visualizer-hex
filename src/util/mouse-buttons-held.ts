import { MouseButtonFlag } from "../constants/mouse-buttons";

export function mouseButtonsHeld(
  buttons: number,
  ...buttonFlags: MouseButtonFlag[]
) {
  for (const flag of buttonFlags) {
    if ((buttons & flag) !== flag) {
      return false;
    }
  }
  return true;
}
