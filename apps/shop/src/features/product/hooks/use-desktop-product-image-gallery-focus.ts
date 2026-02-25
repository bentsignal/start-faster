import { useEffect, useRef } from "react";

interface UseInitialDesktopVariantImageFocusArgs {
  isMobile: boolean;
  initialVariantImageFocusMode: "reorder" | "scroll";
  selectedVariantImageIndex: number | null;
  scrollToImage: (index: number) => void;
}

interface UseDesktopVariantImageScrollArgs {
  isMobile: boolean;
  variantImageScrollIndex: number | null;
  variantImageScrollRequestId: number;
  scrollToImage: (index: number) => void;
}

export function useInitialDesktopVariantImageFocus({
  isMobile,
  initialVariantImageFocusMode,
  selectedVariantImageIndex,
  scrollToImage,
}: UseInitialDesktopVariantImageFocusArgs) {
  const hasAutoFocusedSelectedVariantImageRef = useRef(false);

  useEffect(() => {
    if (isMobile || hasAutoFocusedSelectedVariantImageRef.current) {
      return;
    }

    hasAutoFocusedSelectedVariantImageRef.current = true;

    if (
      initialVariantImageFocusMode === "scroll" &&
      selectedVariantImageIndex !== null &&
      selectedVariantImageIndex > 0
    ) {
      scrollToImage(selectedVariantImageIndex);
    }
  }, [
    initialVariantImageFocusMode,
    isMobile,
    scrollToImage,
    selectedVariantImageIndex,
  ]);
}

export function useDesktopVariantImageScroll({
  isMobile,
  variantImageScrollIndex,
  variantImageScrollRequestId,
  scrollToImage,
}: UseDesktopVariantImageScrollArgs) {
  useEffect(() => {
    if (isMobile) {
      return;
    }

    if (variantImageScrollRequestId === 0 || variantImageScrollIndex === null) {
      return;
    }

    scrollToImage(variantImageScrollIndex);
  }, [
    isMobile,
    scrollToImage,
    variantImageScrollIndex,
    variantImageScrollRequestId,
  ]);
}
