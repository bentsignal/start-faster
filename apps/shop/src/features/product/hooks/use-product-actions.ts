import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { useProductPurchaseActions } from "~/features/product/hooks/use-product-purchase-actions";
import { useSelectedVariant } from "~/features/product/hooks/use-selected-variant";
import { productQueries } from "~/features/product/lib/product-queries";

export function useProductActions() {
  const { handle } = useParams({ from: "/shop/$handle" });
  const { data } = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (p) => ({ title: p.title, handle: p.handle }),
  });
  const { selectedVariant } = useSelectedVariant();
  const purchaseActions = useProductPurchaseActions({
    productTitle: data.title,
    productHandle: data.handle,
    selectedVariant,
  });

  return { selectedVariant, ...purchaseActions };
}
