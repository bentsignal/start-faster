import type { ReactNode } from "react";

import { cn } from "../lib/utils";

export const IMAGE_BLOCK_MIN_PADDING = 0;
export const IMAGE_BLOCK_MAX_PADDING = 96;
export const IMAGE_BLOCK_DEFAULT_PADDING = 0;

export const IMAGE_BLOCK_MIN_WIDTH_SCALE = 0.25;
export const IMAGE_BLOCK_MAX_WIDTH_SCALE = 1;
export const IMAGE_BLOCK_DEFAULT_WIDTH_SCALE = 1;

export function clampImageBlockWidthScale(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return IMAGE_BLOCK_DEFAULT_WIDTH_SCALE;
  }
  return Math.min(
    IMAGE_BLOCK_MAX_WIDTH_SCALE,
    Math.max(IMAGE_BLOCK_MIN_WIDTH_SCALE, value),
  );
}

export function ImageBlockWrapper({
  widthScale,
  className,
  children,
}: {
  widthScale: number;
  className?: string;
  children: ReactNode;
}) {
  const scale = clampImageBlockWidthScale(widthScale);

  return (
    <div data-slot="image-block-display" className={cn("w-full", className)}>
      <div
        data-slot="image-block-display-inner"
        className="mx-auto"
        style={{
          width: `${(scale * 100).toFixed(2)}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
