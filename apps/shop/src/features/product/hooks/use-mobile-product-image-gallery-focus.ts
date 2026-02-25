import { useEffect, useRef } from "react";

import type { CarouselApi } from "@acme/ui/carousel";

interface UseInitialMobileVariantImageFocusArgs {
  carouselApi: CarouselApi | null;
  initialVariantImageFocusMode: "reorder" | "scroll";
  selectedVariantImageIndex: number | null;
}

interface UseMobileVariantImageScrollArgs {
  carouselApi: CarouselApi | null;
  variantImageScrollIndex: number | null;
  variantImageScrollRequestId: number;
}

export function useInitialMobileVariantImageFocus({
  carouselApi,
  initialVariantImageFocusMode,
  selectedVariantImageIndex,
}: UseInitialMobileVariantImageFocusArgs) {
  const hasAutoFocusedSelectedVariantImageRef = useRef(false);

  useEffect(() => {
    if (carouselApi === null || hasAutoFocusedSelectedVariantImageRef.current) {
      return;
    }

    hasAutoFocusedSelectedVariantImageRef.current = true;

    if (
      initialVariantImageFocusMode === "scroll" &&
      selectedVariantImageIndex !== null &&
      selectedVariantImageIndex > 0
    ) {
      carouselApi.scrollTo(selectedVariantImageIndex);
    }
  }, [carouselApi, initialVariantImageFocusMode, selectedVariantImageIndex]);
}

export function useMobileVariantImageScroll({
  carouselApi,
  variantImageScrollIndex,
  variantImageScrollRequestId,
}: UseMobileVariantImageScrollArgs) {
  useEffect(() => {
    if (
      carouselApi === null ||
      variantImageScrollRequestId === 0 ||
      variantImageScrollIndex === null
    ) {
      return;
    }

    carouselApi.scrollTo(variantImageScrollIndex);
  }, [carouselApi, variantImageScrollIndex, variantImageScrollRequestId]);
}
