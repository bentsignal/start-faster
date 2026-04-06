import { useMutation } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { Product } from "~/features/product/types";
import {
  getStoredCartId,
  setStoredCartId,
  setStoredCartQuantity,
} from "~/features/cart/lib/cart-storage";
import { productMutations } from "~/features/product/lib/product-mutations";

export type ProductVariantNode = Product["variants"]["nodes"][number];

export function useBuyNow(selectedVariant: ProductVariantNode | null) {
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
