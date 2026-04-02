import { useEffect, useRef, useState } from "react";
import { useMutationState, useSuspenseQuery } from "@tanstack/react-query";
import { createStore } from "rostra";

import type { Cart } from "~/features/cart/types";
import { clearCartStorage } from "~/features/cart/hooks/cart-mutation-shared";
import { useCartStorage } from "~/features/cart/hooks/use-cart-storage";
import { cartMutations } from "~/features/cart/lib/cart-mutations";
import {
  applyPendingMutationsToCart,
  parsePendingCartMutation,
} from "~/features/cart/lib/cart-pending-mutations";
import { cartQueries } from "~/features/cart/lib/cart-queries";
import { useIsHydrated } from "~/hooks/use-is-hydrated";
import { formatMoney } from "~/lib/format-money";

function useInternalStore() {
  const { isCartOpen, setIsCartOpen, openCartWithDelay } = useCartSheet();
  const idState = useCartId();
  const cartId = idState.cartId;
  const cart = useOptimisticCart(cartId);

  const cartQuantity = useCartQuantity(cart, idState);
  const totalLabel = useTotalLabel(cart);
  const cartLines = cart?.lines.nodes ?? [];
  const checkoutUrl = cart?.checkoutUrl ?? null;

  return {
    isCartOpen,
    setIsCartOpen,
    openCartWithDelay,
    cartId,
    cartQuantity,
    totalLabel,
    cartLines,
    checkoutUrl,
  };
}

export const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

// ---------------------------------------------------------------------------
// Internal hooks — not exported, accessed only through the store
// ---------------------------------------------------------------------------

function useTotalLabel(cart: Cart | null) {
  const totalAmount = cart?.cost.totalAmount ?? null;
  return totalAmount === null
    ? formatMoney(0, "USD")
    : formatMoney(totalAmount.amount, totalAmount.currencyCode);
}

interface CartIdState {
  cartId: string | null;
  cookieQuantity: number;
  isHydrated: boolean;
  storedQuantity: number;
}

function useCartQuantity(cart: Cart | null, idState: CartIdState) {
  return (
    cart?.totalQuantity ??
    getFallbackQuantity({
      cartId: idState.cartId,
      cookieQuantity: idState.cookieQuantity,
      isHydrated: idState.isHydrated,
      storedQuantity: idState.storedQuantity,
    })
  );
}

function getFallbackQuantity({
  cartId,
  cookieQuantity,
  isHydrated,
  storedQuantity,
}: {
  cartId: string | null;
  cookieQuantity: number;
  isHydrated: boolean;
  storedQuantity: number;
}) {
  if (cartId === null) return 0;
  if (storedQuantity > 0) {
    return storedQuantity;
  }

  return isHydrated ? 0 : cookieQuantity;
}

function useCartId() {
  const { data: cookieData } = useSuspenseQuery({
    ...cartQueries.cookie(),
    select: (data) => ({ id: data.id, quantity: data.quantity }),
  });

  const isHydrated = useIsHydrated();
  const storedCart = useCartStorage();
  const cartId = storedCart.id ?? (isHydrated ? null : cookieData.id) ?? null;

  return {
    cartId,
    cookieQuantity: cookieData.quantity,
    isHydrated,
    storedQuantity: storedCart.quantity,
  } as const satisfies CartIdState;
}

function useOptimisticCart(cartId: string | null) {
  const { data: cartData, status: cartStatus } = useSuspenseQuery({
    ...cartQueries.detail(cartId),
    // eslint-disable-next-line no-restricted-syntax -- full Cart object needed by optimistic mutation pipeline (applyPendingMutationsToCart)
    select: (cart) => cart,
  });

  const pendingMutations = useMutationState({
    filters: {
      mutationKey: cartMutations.lineAll().mutationKey,
      status: "pending",
    },
    select: parsePendingCartMutation,
  }).filter((mutation) => mutation !== null);

  const cart = applyPendingMutationsToCart(cartData, pendingMutations);

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

  return cart;
}

function useCartSheet() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openTimerIdRef = useRef<number | null>(null);

  const openCartWithDelay = (delayMs = 500) => {
    if (typeof window === "undefined") {
      setIsCartOpen(true);
      return;
    }

    if (openTimerIdRef.current !== null) {
      window.clearTimeout(openTimerIdRef.current);
    }

    openTimerIdRef.current = window.setTimeout(() => {
      setIsCartOpen(true);
      openTimerIdRef.current = null;
    }, delayMs);
  };

  // eslint-disable-next-line no-restricted-syntax -- cleanup timer on unmount (external browser timer)
  useEffect(() => {
    return () => {
      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }
    };
  }, []);

  return {
    isCartOpen,
    setIsCartOpen,
    openCartWithDelay,
  };
}
