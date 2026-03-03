import { createStore } from "rostra";

import type { SearchResultProductNode } from "~/features/search/types";
import { useProductPurchaseActions } from "~/features/product/hooks/use-product-purchase-actions";
import { formatPrice } from "~/features/product/lib/price";

function useInternalStore({ product }: { product: SearchResultProductNode }) {
  const selectedVariant = product.selectedOrFirstAvailableVariant ?? null;
  const isUnavailable =
    selectedVariant === null || selectedVariant.availableForSale === false;
  const purchaseActions = useProductPurchaseActions({
    productTitle: product.title,
    productHandle: product.handle,
    selectedVariant,
  });

  const price = formatPrice(
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode,
  );

  return {
    product,
    selectedVariant,
    isUnavailable,
    price,
    ...purchaseActions,
  };
}

export const { Store: ProductResultStore, useStore: useProductResultStore } =
  createStore(useInternalStore);
