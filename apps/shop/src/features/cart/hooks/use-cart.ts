import { useEffect } from "react";
import { useMutationState, useSuspenseQuery } from "@tanstack/react-query";

import { clearCartStorage } from "~/features/cart/hooks/cart-mutation-shared";
import {
  applyPendingMutationsToCart,
  parsePendingCartMutation,
} from "~/features/cart/lib/cart-pending-mutations";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
import {
  getStoredCartId,
  getStoredCartQuantity,
} from "~/features/cart/lib/cart-storage";

function getFallbackQuantity(cartId: string | null, cookieQuantity: number) {
  if (cartId === null) return 0;
  const stored = getStoredCartQuantity();
  return stored > 0 ? stored : cookieQuantity;
}

export function useCart() {
  const { data: cookieData } = useSuspenseQuery({
    ...cartQueries.cookie(),
    select: (data) => ({ id: data.id, quantity: data.quantity }),
  });

  const cartId = getStoredCartId() ?? cookieData.id ?? null;

  const { data: cartData, status: cartStatus } = useSuspenseQuery({
    ...cartQueries.detail(cartId),
    // eslint-disable-next-line no-restricted-syntax -- full Cart object needed by optimistic mutation pipeline (applyPendingMutationsToCart)
    select: (cart) => cart,
  });

  const pendingMutations = useMutationState({
    filters: {
      mutationKey: cartMutationKeys.lineAll,
      status: "pending",
    },
    select: parsePendingCartMutation,
  }).filter((mutation) => mutation !== null);

  const cart = applyPendingMutationsToCart(cartData, pendingMutations);
  const cartQuantity =
    cart?.totalQuantity ?? getFallbackQuantity(cartId, cookieData.quantity);

  // eslint-disable-next-line no-restricted-syntax -- syncs query result with external localStorage state
  useEffect(() => {
    if (cartId === null) {
      return;
    }

    if (cartStatus !== "success") {
      return;
    }

    if (cartData !== null) {
      return;
    }

    clearCartStorage();
  }, [cartId, cartData, cartStatus]);

  return {
    cartId,
    cart,
    cartQuantity,
  };
}
