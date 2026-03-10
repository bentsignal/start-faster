import { useMemo } from "react";

import type { Product } from "~/features/product/types";
import { getProductGalleryOrdering } from "~/features/product/lib/gallery-images";

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
  return useMemo(() => {
    return getProductGalleryOrdering({
      product,
      variants,
      initialVariantId,
    });
  }, [initialVariantId, product, variants]);
}
