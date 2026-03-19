import type { ImgHTMLAttributes, SyntheticEvent } from "react";
import { useRef, useState } from "react";

import { cn } from "@acme/ui/utils";

import { useVercelOptimizedImageProps } from "./use-vercel-image";

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  width: number;
  height: number;
  alt: string;
  optimizerBaseUrl?: string;
  disableReveal?: boolean;
  errorFallbackText?: string;
}

type ImageLoadState = "loading" | "ready" | "error";

const loadedImageSignatures = new Set<string>();

const getImageSignature = ({
  src,
  srcSet,
  sizes,
}: {
  src?: string;
  srcSet?: string;
  sizes?: string;
}) => {
  return [src ?? "", srcSet ?? "", sizes ?? ""].join("|");
};

const imageElementIsReady = (image: HTMLImageElement) => {
  return image.complete && image.naturalWidth > 0;
};

export function Image({
  src,
  width,
  height,
  sizes,
  optimizerBaseUrl,
  loading = "lazy",
  disableReveal = false,
  errorFallbackText = "Failed to load image",
  className,
  onLoad,
  onError,
  style,
  ...props
}: ImageProps) {
  const shouldReveal = !disableReveal;
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imgProps = useVercelOptimizedImageProps(
    src,
    width,
    height,
    sizes,
    optimizerBaseUrl,
  );
  const imageSignature = getImageSignature({
    src: imgProps.src,
    srcSet: imgProps.srcSet,
    sizes: imgProps.sizes,
  });

  const [loadState, setLoadState] = useState<{
    signature: string;
    state: ImageLoadState;
  }>(() => {
    if (!shouldReveal || loadedImageSignatures.has(imageSignature)) {
      return {
        signature: imageSignature,
        state: "ready",
      };
    }
    return {
      signature: imageSignature,
      state: "loading",
    };
  });

  const loadStateForCurrentImage =
    loadState.signature === imageSignature
      ? loadState.state
      : !shouldReveal || loadedImageSignatures.has(imageSignature)
        ? "ready"
        : "loading";

  const setImageRef = (imageElement: HTMLImageElement | null) => {
    imageRef.current = imageElement;

    if (
      imageElement !== null &&
      shouldReveal &&
      loadStateForCurrentImage === "loading" &&
      imageElementIsReady(imageElement)
    ) {
      if (loadedImageSignatures.has(imageSignature)) {
        setLoadState({
          signature: imageSignature,
          state: "ready",
        });
        return;
      }

      // If an image is already complete during hydration/full reload, we still
      // want a first-view fade. Wait for a paint before revealing it.
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          loadedImageSignatures.add(imageSignature);
          setLoadState({
            signature: imageSignature,
            state: "ready",
          });
        });
      });
    }
  };

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    if (shouldReveal) {
      loadedImageSignatures.add(imageSignature);
      setLoadState({
        signature: imageSignature,
        state: "ready",
      });
    }
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    if (shouldReveal) {
      setLoadState({
        signature: imageSignature,
        state: "error",
      });
    }
    onError?.(event);
  };

  const hideImage =
    shouldReveal &&
    (loadStateForCurrentImage === "loading" ||
      loadStateForCurrentImage === "error");

  if (shouldReveal && loadStateForCurrentImage === "error") {
    return (
      <div
        className={cn(
          "bg-muted/60 text-muted-foreground flex items-center justify-center text-center text-sm",
          className,
        )}
      >
        {errorFallbackText}
      </div>
    );
  }

  return (
    <img
      ref={setImageRef}
      loading={loading}
      {...imgProps}
      {...props}
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        "motion-reduce:transition-none",
        shouldReveal && "transition-opacity duration-300 ease-out",
        className,
      )}
      style={{
        ...style,
        opacity: hideImage ? 0 : style?.opacity,
      }}
    />
  );
}
