import type { ImgWidth } from "./sizes";
import { env } from "~/env";
import { imageWidths, largestImageWidth } from "./sizes";

const imageQuality = 75;
const uploadThingHostname = new URL(env.VITE_UT_URL).hostname;

const getVercelOptimizedUrl = (url: string, width: ImgWidth) => {
  const searchParams = new URLSearchParams();
  searchParams.append("url", url);
  searchParams.append("w", width.toString());
  searchParams.append("q", imageQuality.toString());
  return `/_vercel/image?${searchParams.toString()}`;
};

const normalizeImageSourceUrl = (src: string) => {
  if (src.startsWith("/")) {
    return src.split("?")[0]?.split("#")[0] ?? src;
  }

  try {
    const url = new URL(src);
    url.hash = "";

    if (
      url.hostname === "cdn.shopify.com" ||
      url.hostname === uploadThingHostname
    ) {
      // Canonicalize remote URLs so query noise cannot create unbounded cache keys.
      url.search = "";
    }

    return url.toString();
  } catch {
    return src.split("#")[0] ?? src;
  }
};

export const useVercelOptimizedImageProps = (
  src: string,
  width: number,
  height: number,
  sizes?: string,
) => {
  const normalizedSrc = normalizeImageSourceUrl(src);

  if (env.VITE_NODE_ENV === "development") {
    return { src, width, height, sizes };
  }

  if (sizes) {
    const maxResponsiveWidth = Math.min(width * 2, largestImageWidth);
    const responsiveWidths = imageWidths.filter(
      (candidateWidth) => candidateWidth <= maxResponsiveWidth,
    );
    const widths =
      responsiveWidths.length > 0 ? responsiveWidths : [largestImageWidth];
    const largestRequestedWidth = widths.at(-1) ?? largestImageWidth;

    return {
      src: getVercelOptimizedUrl(normalizedSrc, largestRequestedWidth),
      srcSet: widths
        .map((candidateWidth) => {
          return `${getVercelOptimizedUrl(normalizedSrc, candidateWidth)} ${candidateWidth}w`;
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
      .map((w, i) => `${getVercelOptimizedUrl(normalizedSrc, w)} ${i + 1}x`)
      .join(", "),
    src: getVercelOptimizedUrl(normalizedSrc, widths[0]),
    width: widths[0],
    height: Math.round((widths[0] * height) / width),
  };
};
