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
  sizes?: string,
) =>
  useMemo(() => {
    if (env.VITE_NODE_ENV === "development") {
      return { src, width, height, sizes };
    }

    if (sizes) {
      const responsiveWidths = imageWidths.filter((candidateWidth) => {
        return candidateWidth <= width;
      });
      const widths: [ImgWidth, ...ImgWidth[]] =
        responsiveWidths.length > 0
          ? (responsiveWidths as [ImgWidth, ...ImgWidth[]])
          : [largestImageWidth];
      const largestRequestedWidth = widths.at(-1) ?? largestImageWidth;

      return {
        src: getVercelOptimizedUrl(src, largestRequestedWidth),
        srcSet: widths
          .map((candidateWidth) => {
            return `${getVercelOptimizedUrl(src, candidateWidth)} ${candidateWidth}w`;
          })
          .join(", "),
        sizes,
        width,
        height,
      };
    }

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
  }, [src, width, height, sizes]);
