import { useMemo } from "react";

import type { Product } from "~/features/product/types";
import {
  getProductGalleryImages,
  getVariantImageIndex,
} from "~/features/product/lib/gallery-images";

interface UseProductGalleryImagesArgs {
  product: Product;
  variants: Product["variants"]["nodes"];
  selectedVariantId?: string;
}

export function useProductGalleryImages({
  product,
  variants,
  selectedVariantId,
}: UseProductGalleryImagesArgs) {
  const baseGalleryImages = useMemo(
    () => getProductGalleryImages(product),
    [product],
  );

  return useMemo(() => {
    if (selectedVariantId === undefined) {
      return baseGalleryImages;
    }

    const initialVariant =
      variants.find((variant) => variant.id === selectedVariantId) ?? null;
    const variantImageIndex = getVariantImageIndex({
      images: baseGalleryImages,
      variant: initialVariant,
    });

    if (variantImageIndex === null || variantImageIndex === 0) {
      return baseGalleryImages;
    }

    const variantImage = baseGalleryImages[variantImageIndex];

    if (variantImage === undefined) {
      return baseGalleryImages;
    }

    return [
      variantImage,
      ...baseGalleryImages.filter((_, index) => index !== variantImageIndex),
    ];
  }, [baseGalleryImages, selectedVariantId, variants]);
}
