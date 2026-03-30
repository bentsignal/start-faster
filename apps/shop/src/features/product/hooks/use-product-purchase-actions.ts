import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { CurrencyCode } from "@acme/shopify/storefront/types";
import { toast } from "@acme/ui/toaster";

import { useAddCartLine } from "~/features/cart/hooks/use-add-cart-line";
import { useCart } from "~/features/cart/hooks/use-cart";
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

function useBuyNow(selectedVariant: PurchasableVariant | null) {
  const mutation = useMutation({
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

  function buyNow() {
    if (
      selectedVariant === null ||
      selectedVariant.availableForSale === false
    ) {
      return;
    }

    mutation.mutate(selectedVariant.id);
  }

  return { buyNow, isBuyingNow: mutation.isPending };
}

function useAddToCart({
  productTitle,
  productHandle,
  selectedVariant,
}: {
  productTitle: string;
  productHandle: string;
  selectedVariant: PurchasableVariant | null;
}) {
  const openCartWithDelay = useCartStore((store) => store.openCartWithDelay);
  const { cartId } = useCart();
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

export function useProductPurchaseActions({
  productTitle,
  productHandle,
  selectedVariant,
}: {
  productTitle: string;
  productHandle: string;
  selectedVariant: PurchasableVariant | null;
}) {
  const { buyNow, isBuyingNow } = useBuyNow(selectedVariant);
  const { addToCart, wasAddedToCart } = useAddToCart({
    productTitle,
    productHandle,
    selectedVariant,
  });

  return { addToCart, wasAddedToCart, buyNow, isBuyingNow };
}
