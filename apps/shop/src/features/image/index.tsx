import type { ImgHTMLAttributes } from "react";

import { useVercelOptimizedImageProps } from "./utils";

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export function Image({
  src,
  width,
  height,
  loading = "lazy",
  ...props
}: ImageProps) {
  const imgProps = useVercelOptimizedImageProps(src, width, height);
  return <img loading={loading} {...imgProps} {...props} />;
}
