import { useMemo, useState } from "react";

import type { Product } from "~/features/product/types";
import {
  getProductGalleryImages,
  getVariantImageIndex,
} from "~/features/product/lib/gallery-images";

interface UseProductGalleryImagesArgs {
  product: Product;
  variants: Product["variants"]["nodes"];
  initialVariantId?: string;
}

export function useProductGalleryImages({
  product,
  variants,
  initialVariantId,
}: UseProductGalleryImagesArgs) {
  const [initialVariantIdOnLoad] = useState(initialVariantId);
  const baseGalleryImages = useMemo(
    () => getProductGalleryImages(product),
    [product],
  );

  return useMemo(() => {
    if (initialVariantIdOnLoad === undefined) {
      return baseGalleryImages;
    }

    const initialVariant =
      variants.find((variant) => variant.id === initialVariantIdOnLoad) ?? null;
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
  }, [baseGalleryImages, initialVariantIdOnLoad, variants]);
}
