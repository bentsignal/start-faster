import * as React from "react";

const SM = 640;
const MD = 768;
const LG = 1024;
const XL = 1280;
const XXL = 1536;

export const ScreenSize = {
  BASE: "base",
  SM: "sm",
  MD: "md",
  LG: "lg",
  XL: "xl",
  XXL: "2xl",
} as const;

type ScreenSizeValue = (typeof ScreenSize)[keyof typeof ScreenSize];

const SCREEN_ORDER = {
  base: 0,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  "2xl": 5,
} as const satisfies Record<ScreenSizeValue, number>;

function getScreenSize(width: number): ScreenSizeValue {
  if (width >= XXL) return "2xl";
  if (width >= XL) return "xl";
  if (width >= LG) return "lg";
  if (width >= MD) return "md";
  if (width >= SM) return "sm";
  return "base";
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getSnapshot() {
  return getScreenSize(window.innerWidth);
}

function getServerSnapshot() {
  return undefined;
}

function isBiggerThan(current: ScreenSizeValue, target: ScreenSizeValue) {
  return SCREEN_ORDER[current] >= SCREEN_ORDER[target];
}

function isSmallerThan(current: ScreenSizeValue, target: ScreenSizeValue) {
  return SCREEN_ORDER[current] <= SCREEN_ORDER[target];
}

export function useScreen() {
  const size = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return {
    size,
    isBiggerThan: (target: ScreenSizeValue) =>
      size !== undefined && isBiggerThan(size, target),
    isSmallerThan: (target: ScreenSizeValue) =>
      size !== undefined && isSmallerThan(size, target),
  };
}
