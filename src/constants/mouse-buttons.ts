export const MouseButtonFlags = {
  left: 1,
  right: 2,
  middle: 4,
} as const;

export type MouseButtonFlag =
  (typeof MouseButtonFlags)[keyof typeof MouseButtonFlags];
