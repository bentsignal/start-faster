import { useMemo } from "react";
import { createStore } from "rostra";

import type { Product } from "./types";
import { useProductGalleryImages } from "~/features/product/hooks/use-product-gallery-images";
import { useProductOptions } from "~/features/product/hooks/use-product-options";
import { useProductVariantActions } from "~/features/product/hooks/use-product-variant-actions";
import { useSelectedProductVariant } from "~/features/product/hooks/use-selected-product-variant";
import { formatPrice } from "~/features/product/lib/price";

interface ProductStoreProps {
  product: Product;
  variant?: string;
}

function useInternalStore({ product, variant }: ProductStoreProps) {
  const variants = product.variants.nodes;
  const options = useProductOptions(product);
  const { selectedVariant, selectedOptions } = useSelectedProductVariant({
    variants,
    variantId: variant,
  });
  const galleryImages = useProductGalleryImages({
    product,
    variants,
    selectedVariantId: selectedVariant?.id,
  });
  const { selectOption, buyNow, isBuyingNow } = useProductVariantActions({
    variants,
    selectedVariant,
    selectedOptions,
  });

  const selectedPrice =
    selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const price = useMemo(
    () => formatPrice(selectedPrice.amount, selectedPrice.currencyCode),
    [selectedPrice.amount, selectedPrice.currencyCode],
  );

  const storeValue = {
    product,
    options,
    galleryImages,
    price,
    selectedVariant,
    selectedOptions,
    selectOption,
    buyNow,
    isBuyingNow,
  };

  return storeValue;
}

const { Store: ProductStore, useStore: useProductStore } =
  createStore(useInternalStore);

export { ProductStore, useProductStore };
