import { createStore } from "rostra";

import type { ProductResultNode } from "~/features/product/types";
import { useProductPurchaseActions } from "~/features/product/hooks/use-product-purchase-actions";
import { formatPrice } from "~/features/product/lib/price";

function useInternalStore({ product }: { product: ProductResultNode }) {
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
