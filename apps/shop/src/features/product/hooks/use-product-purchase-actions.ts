import { useMutation } from "@tanstack/react-query";

import type { CurrencyCode } from "@acme/shopify/storefront/types";
import { toast } from "@acme/ui/toaster";

import {
  getStoredCartId,
  setStoredCartId,
  setStoredCartQuantity,
} from "~/features/cart/lib/cart-storage";
import { useAddToCart } from "~/features/product/hooks/use-add-to-cart";
import { productMutations } from "~/features/product/lib/product-mutations";

export interface PurchasableVariant {
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
    ...productMutations.buyNow(),
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

    mutation.mutate({
      cartId: getStoredCartId(),
      merchandiseId: selectedVariant.id,
    });
  }

  return { buyNow, isBuyingNow: mutation.isPending };
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
