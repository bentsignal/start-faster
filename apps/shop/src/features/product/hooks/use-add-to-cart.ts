import { useEffect, useRef, useState } from "react";

import type { PurchasableVariant } from "~/features/product/hooks/use-product-purchase-actions";
import { useAddCartLine } from "~/features/cart/hooks/use-add-cart-line";
import { useCartStore } from "~/features/cart/store";

export function useAddToCart({
  productTitle,
  productHandle,
  selectedVariant,
}: {
  productTitle: string;
  productHandle: string;
  selectedVariant: PurchasableVariant | null;
}) {
  const openCartWithDelay = useCartStore((store) => store.openCartWithDelay);
  const cartId = useCartStore((store) => store.cartId);
  const addCartLine = useAddCartLine({ cartId });
  const [wasAddedToCart, setWasAddedToCart] = useState(false);
  const feedbackTimeoutId = useRef<number | null>(null);

  // eslint-disable-next-line no-restricted-syntax -- cleanup timer on unmount (external browser timer)
  useEffect(() => {
    return () => {
      if (feedbackTimeoutId.current !== null) {
        window.clearTimeout(feedbackTimeoutId.current);
      }
    };
  }, []);

  function addToCart() {
    if (
      selectedVariant === null ||
      selectedVariant.availableForSale === false
    ) {
      return;
    }

    setWasAddedToCart(true);
    if (feedbackTimeoutId.current !== null) {
      window.clearTimeout(feedbackTimeoutId.current);
    }
    feedbackTimeoutId.current = window.setTimeout(() => {
      setWasAddedToCart(false);
      feedbackTimeoutId.current = null;
    }, 500);

    const variantImage = selectedVariant.image ?? null;

    addCartLine.mutate({
      merchandiseId: selectedVariant.id,
      quantity: 1,
      optimisticLine: {
        merchandiseId: selectedVariant.id,
        quantity: 1,
        unitAmount: selectedVariant.price.amount,
        currencyCode: selectedVariant.price.currencyCode,
        variantTitle: selectedVariant.title,
        productTitle,
        productHandle,
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
    openCartWithDelay(250);
  }

  return { addToCart, wasAddedToCart };
}
