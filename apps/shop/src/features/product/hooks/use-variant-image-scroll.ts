import { useMemo, useState } from "react";

import type { Product, ProductGalleryImage } from "~/features/product/types";
import { getVariantImageIndex } from "~/features/product/lib/gallery-images";

interface UseVariantImageScrollArgs {
  galleryImages: ProductGalleryImage[];
  variants: Product["variants"]["nodes"];
  selectedVariant: Product["variants"]["nodes"][number] | null;
}

export function useVariantImageScroll({
  galleryImages,
  variants,
  selectedVariant,
}: UseVariantImageScrollArgs) {
  const [variantImageScrollRequest, setVariantImageScrollRequest] = useState<{
    id: number;
    variantId: string;
  } | null>(null);

  const selectedVariantImageIndex = useMemo(
    () =>
      getVariantImageIndex({ images: galleryImages, variant: selectedVariant }),
    [galleryImages, selectedVariant],
  );
  const variantImageScrollIndex = useMemo(() => {
    if (variantImageScrollRequest === null) {
      return null;
    }

    const targetVariant =
      variants.find(
        (variant) => variant.id === variantImageScrollRequest.variantId,
      ) ?? null;

    return getVariantImageIndex({
      images: galleryImages,
      variant: targetVariant,
    });
  }, [galleryImages, variantImageScrollRequest, variants]);

  function requestVariantImageScroll(variantId: string) {
    setVariantImageScrollRequest((previousRequest) => ({
      id: (previousRequest?.id ?? 0) + 1,
      variantId,
    }));
  }

  return {
    selectedVariantImageIndex,
    variantImageScrollIndex,
    variantImageScrollRequestId: variantImageScrollRequest?.id ?? 0,
    requestVariantImageScroll,
  };
}
