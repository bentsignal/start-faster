import type { ImgHTMLAttributes } from "react";

import { useVercelOptimizedImageProps } from "./utils";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export function VImage({
  src,
  width,
  height,
  sizes,
  loading = "lazy",
  ...props
}: ImageProps) {
  const imgProps = useVercelOptimizedImageProps(src, width, height, sizes);
  return <img loading={loading} {...imgProps} {...props} />;
}
