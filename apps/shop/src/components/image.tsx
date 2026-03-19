import type { ImageProps } from "@acme/features/image";
import { Image as BaseImage } from "@acme/features/image";

export function Image(props: Omit<ImageProps, "optimizerBaseUrl">) {
  return <BaseImage {...props} />;
}
