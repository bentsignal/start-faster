import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { useSelectedVariant } from "~/features/product/hooks/use-selected-variant";
import { formatPrice } from "~/features/product/lib/price";
import { productQueries } from "~/features/product/lib/product-queries";

export function useProductPrice() {
  const { handle } = useParams({ from: "/shop/$handle" });
  const fallbackPrice = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (p) => p.priceRange.minVariantPrice,
  }).data;
  const { selectedVariant } = useSelectedVariant();
  const selectedPrice = selectedVariant?.price ?? fallbackPrice;
  return {
    price: formatPrice(selectedPrice.amount, selectedPrice.currencyCode),
  };
}
