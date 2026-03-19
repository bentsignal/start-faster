import { useRef, useState } from "react";
import { createStore } from "rostra";

import type { CarouselApi } from "@acme/ui/carousel";

import type { Product } from "../types";
import { useProductGalleryImages } from "~/features/product/hooks/use-product-gallery-images";
import { useProductOptions } from "~/features/product/hooks/use-product-options";
import { useProductVariantActions } from "~/features/product/hooks/use-product-variant-actions";
import { useSelectedProductVariant } from "~/features/product/hooks/use-selected-product-variant";
import { getDefaultVariantIdFromGalleryOrdering } from "~/features/product/lib/gallery-images";
import { formatPrice } from "~/features/product/lib/price";

interface ProductPageStoreProps {
  product: Product;
  variant?: string;
}

function useInternalStore({ product, variant }: ProductPageStoreProps) {
  const variants = product.variants.nodes;
  const [initialVariantId] = useState(variant);
  const carouselApiRef = useRef<CarouselApi | null>(null);
  const desktopScrollToImageRef = useRef<((index: number) => void) | null>(
    null,
  );
  const galleryOrdering = useProductGalleryImages({
    product,
    variants,
    initialVariantId,
  });
  const defaultVariantId = getDefaultVariantIdFromGalleryOrdering({
    variants,
    variantImageIndexById: galleryOrdering.variantImageIndexById,
  });
  const options = useProductOptions(product, galleryOrdering.colorOrder);
  const setCarouselApi = (carouselApi: CarouselApi) => {
    carouselApiRef.current = carouselApi;
  };
  const setDesktopScrollToImage = (
    scrollToImage: ((index: number) => void) | null,
  ) => {
    desktopScrollToImageRef.current = scrollToImage;
  };
  const { selectedVariant, selectedOptions } = useSelectedProductVariant({
    variants,
    variantId: variant,
    defaultVariantId,
  });
  const { selectOption, addToCart, wasAddedToCart, buyNow, isBuyingNow } =
    useProductVariantActions({
      carouselApi: carouselApiRef,
      scrollDesktopGalleryToImage: desktopScrollToImageRef,
      variantImageIndexById: galleryOrdering.variantImageIndexById,
      variants,
      productTitle: product.title,
      productHandle: product.handle,
      selectedVariant,
      selectedOptions,
    });

  const selectedPrice =
    selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const price = formatPrice(selectedPrice.amount, selectedPrice.currencyCode);

  const storeValue = {
    product,
    options,
    galleryImages: galleryOrdering.images,
    price,
    selectedVariant,
    selectedOptions,
    selectOption,
    addToCart,
    wasAddedToCart,
    buyNow,
    isBuyingNow,
    setCarouselApi,
    setDesktopScrollToImage,
  };

  return storeValue;
}

const { Store: ProductPageStore, useStore: useProductPageStore } =
  createStore(useInternalStore);

export { ProductPageStore, useProductPageStore };
