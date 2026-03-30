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
  return getProductGalleryOrdering({
    product,
    variants,
    initialVariantId,
  });
}
