import { useMemo } from "react";

import type { ImgWidth } from "./sizes";
import { env } from "~/env";
import { imageWidths, largestImageWidth } from "./sizes";

const getVercelOptimizedUrl = (url: string, width: ImgWidth) => {
  const searchParams = new URLSearchParams();
  searchParams.append("url", url);
  searchParams.append("w", width.toString());
  searchParams.append("q", "75");
  return `/_vercel/image?${searchParams.toString()}`;
};

export const useVercelOptimizedImageProps = (
  src: string,
  width: number,
  height: number,
) =>
  useMemo(() => {
    if (env.VITE_NODE_ENV === "development") return { src, width, height };
    const widths = [
      ...new Set(
        [width, width * 2, width * 3].map(
          (w) => imageWidths.find((p) => p >= w) ?? largestImageWidth,
        ),
      ),
    ] as [ImgWidth, ...ImgWidth[]];
    return {
      srcSet: widths
        .map((w, i) => `${getVercelOptimizedUrl(src, w)} ${i + 1}x`)
        .join(", "),
      width: widths[0],
      height: Math.round((widths[0] * height) / width),
    };
  }, [src, width, height]);
