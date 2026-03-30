import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { CurrencyCode } from "@acme/shopify/storefront/types";
import { toast } from "@acme/ui/toaster";

import {
  getStoredCartId,
  setStoredCartId,
  setStoredCartQuantity,
} from "~/features/cart/lib/cart-storage";
import { prepareCheckoutFn } from "~/features/cart/lib/prepare-checkout";
import { useCartStore } from "~/features/cart/store";

interface PurchasableVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: number;
    currencyCode: CurrencyCode;
  };
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

export function useProductPurchaseActions({
  productTitle,
  productHandle,
  selectedVariant,
}: {
  productTitle: string;
  productHandle: string;
  selectedVariant: PurchasableVariant | null;
}) {
  const openCartWithDelay = useCartStore((store) => store.openCartWithDelay);
  const addCartLine = useCartStore((store) => store.addLine);
  const [wasAddedToCart, setWasAddedToCart] = useState(false);
  const addToCartFeedbackTimeoutId = useRef<number | null>(null);
  const buyNowMutation = useMutation({
    mutationFn: async (merchandiseId: string) => {
      return prepareCheckoutFn({
        data: {
          cartId: getStoredCartId(),
          merchandiseId,
          quantity: 1,
        },
      });
    },
    onSuccess: (nextCheckout) => {
      setStoredCartId(nextCheckout.id);
      setStoredCartQuantity(nextCheckout.totalQuantity);
      window.location.assign(nextCheckout.checkoutUrl);
    },
    onError: () => {
      toast.error("There was an error with your checkout. Please try again.");
    },
  });

  // eslint-disable-next-line no-restricted-syntax -- cleanup timer on unmount (external browser timer)
  useEffect(() => {
    return () => {
      if (addToCartFeedbackTimeoutId.current !== null) {
        window.clearTimeout(addToCartFeedbackTimeoutId.current);
      }
    };
  }, []);

  function buyNow() {
    if (
      selectedVariant === null ||
      selectedVariant.availableForSale === false
    ) {
      return;
    }

    buyNowMutation.mutate(selectedVariant.id);
  }

  function addToCart() {
    if (
      selectedVariant === null ||
      selectedVariant.availableForSale === false
    ) {
      return;
    }

    setWasAddedToCart(true);
    if (addToCartFeedbackTimeoutId.current !== null) {
      window.clearTimeout(addToCartFeedbackTimeoutId.current);
    }
    addToCartFeedbackTimeoutId.current = window.setTimeout(() => {
      setWasAddedToCart(false);
      addToCartFeedbackTimeoutId.current = null;
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

  return {
    addToCart,
    wasAddedToCart,
    buyNow,
    isBuyingNow: buyNowMutation.isPending,
  };
}
