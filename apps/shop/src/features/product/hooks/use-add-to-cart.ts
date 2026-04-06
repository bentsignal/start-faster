import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import type { ProductVariantNode } from "~/features/product/hooks/use-buy-now";
import { useCartStore } from "~/features/cart/cart-store";
import { useAddCartLineMutation } from "~/features/cart/hooks/use-add-cart-line";
import { productQueries } from "~/features/product/lib/product-queries";

export function useAddToCart(selectedVariant: ProductVariantNode | null) {
  const { handle } = useParams({ from: "/shop/$handle" });
  const { data } = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (p) => ({ title: p.title, handle: p.handle }),
  });

  const cartId = useCartStore((store) => store.cartId);
  const addCartLineMutation = useAddCartLineMutation();

  function addToCart() {
    if (
      selectedVariant === null ||
      selectedVariant.availableForSale === false
    ) {
      return;
    }

    const variantImage = selectedVariant.image ?? null;

    addCartLineMutation.mutate({
      cartId: cartId ?? undefined,
      merchandiseId: selectedVariant.id,
      quantity: 1,
      optimisticLine: {
        merchandiseId: selectedVariant.id,
        quantity: 1,
        unitAmount: selectedVariant.price.amount,
        currencyCode: selectedVariant.price.currencyCode,
        variantTitle: selectedVariant.title,
        productTitle: data.title,
        productHandle: data.handle,
        image:
          variantImage === null
            ? null
            : {
                url: variantImage.url,
                altText: variantImage.altText ?? null,
                width: variantImage.width ?? null,
                height: variantImage.height ?? null,
              },
        selectedOptions: selectedVariant.selectedOptions,
      },
    });
  }

  return { addToCart };
}
