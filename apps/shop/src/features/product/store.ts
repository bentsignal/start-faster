import { useMemo } from "react";
import { createStore } from "rostra";

import type { Product } from "./types";
import { useProductGalleryImages } from "~/features/product/hooks/use-product-gallery-images";
import { useProductOptions } from "~/features/product/hooks/use-product-options";
import { useProductRouteVariant } from "~/features/product/hooks/use-product-route-variant";
import { useProductVariantActions } from "~/features/product/hooks/use-product-variant-actions";
import { useSelectedProductVariant } from "~/features/product/hooks/use-selected-product-variant";
import { formatPrice } from "~/features/product/lib/price";

function useInternalStore({ product }: { product: Product }) {
  const { variantId, onVariantIdChange } = useProductRouteVariant();
  const variants = product.variants.nodes;
  const options = useProductOptions(product);
  const { selectedVariant, selectedOptions, setSelectedVariantId } =
    useSelectedProductVariant({
      variants,
      initialVariantId: variantId,
    });
  const galleryImages = useProductGalleryImages({
    product,
    variants,
    initialVariantId: variantId,
  });
  const { selectOption } = useProductVariantActions({
    variants,
    selectedVariant,
    selectedOptions,
    setSelectedVariantId,
    onVariantIdChange,
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
  };

  return storeValue;
}

const { Store: ProductStore, useStore: useProductStore } =
  createStore(useInternalStore);

export { ProductStore, useProductStore };
