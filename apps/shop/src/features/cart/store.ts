import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutationState, useQuery } from "@tanstack/react-query";
import { createStore } from "rostra";

import { clearCartStorage } from "~/features/cart/hooks/use-cart-mutations";
import {
  getStoredCartId,
  getStoredCartQuantity,
} from "~/features/cart/lib/cart-id";
import {
  applyPendingMutationsToCart,
  parsePendingCartMutation,
} from "~/features/cart/lib/cart-pending-mutations";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";

function useInternalStore() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openTimerIdRef = useRef<number | null>(null);

  const openCartWithDelay = useCallback(
    (delayMs = 500) => {
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
    },
    [setIsCartOpen],
  );

  useEffect(() => {
    return () => {
      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }
    };
  }, []);

  const cookieCartQuery = useQuery({
    ...cartQueries.cookie(),
  });

  const cartId = getStoredCartId() ?? cookieCartQuery.data?.id ?? null;

  const cartQuery = useQuery({
    ...cartQueries.detail(cartId),
    enabled: cartId !== null,
  });

  const pendingMutations = useMutationState({
    filters: {
      mutationKey: cartMutationKeys.lineAll,
      status: "pending",
    },
    select: parsePendingCartMutation,
  }).filter((mutation) => mutation !== null);

  const cart = useMemo(
    () => applyPendingMutationsToCart(cartQuery.data ?? null, pendingMutations),
    [cartQuery.data, pendingMutations],
  );
  const storedQuantity = getStoredCartQuantity();
  const fallbackQuantity =
    cartId === null
      ? 0
      : storedQuantity > 0
        ? storedQuantity
        : (cookieCartQuery.data?.quantity ?? 0);
  const cartQuantity = cart?.totalQuantity ?? fallbackQuantity;

  useEffect(() => {
    if (cartId === null) {
      return;
    }

    if (cartQuery.status !== "success") {
      return;
    }

    if (cartQuery.data !== null) {
      return;
    }

    clearCartStorage();
  }, [cartId, cartQuery.data, cartQuery.status]);

  return {
    isCartOpen,
    setIsCartOpen,
    openCartWithDelay,
    cartId,
    cart,
    cartQuery,
    cartQuantity,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
