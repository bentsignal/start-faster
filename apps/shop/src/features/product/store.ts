import { useMemo } from "react";
import { createStore } from "rostra";

import type { Product } from "./types";
import { useProductGalleryImages } from "~/features/product/hooks/use-product-gallery-images";
import { useProductOptions } from "~/features/product/hooks/use-product-options";
import { useProductRouteVariant } from "~/features/product/hooks/use-product-route-variant";
import { useProductVariantActions } from "~/features/product/hooks/use-product-variant-actions";
import { useSelectedProductVariant } from "~/features/product/hooks/use-selected-product-variant";
import { useVariantImageScroll } from "~/features/product/hooks/use-variant-image-scroll";

interface ProductStoreProps {
  handle: string;
  product: Product;
}

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

function useInternalStore({ handle, product }: ProductStoreProps) {
  const { variantId, initialVariantImageFocusMode, onVariantIdChange } =
    useProductRouteVariant();
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
    initialVariantImageFocusMode,
  });
  const {
    selectedVariantImageIndex,
    variantImageScrollIndex,
    variantImageScrollRequestId,
  } = useVariantImageScroll({
    galleryImages,
    variants,
    selectedVariant,
  });
  const { selectOption, setVariantById } = useProductVariantActions({
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

  return {
    handle,
    product,
    options,
    galleryImages,
    selectedVariantImageIndex,
    price,
    selectedVariant,
    selectedOptions,
    variantImageScrollIndex,
    variantImageScrollRequestId,
    initialVariantImageFocusMode,
    selectOption,
    setVariantById,
  };
}

const { Store: ProductStore, useStore: useProductStore } =
  createStore(useInternalStore);

export { ProductStore, useProductStore };
