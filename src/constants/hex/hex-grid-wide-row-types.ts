export const HexGridWideRowTypes = {
  Odd: "odd",
  Even: "even",
} as const;

export type HexGridWideRowType =
  (typeof HexGridWideRowTypes)[keyof typeof HexGridWideRowTypes];
