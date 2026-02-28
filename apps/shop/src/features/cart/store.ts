import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStore } from "rostra";

import type { Cart } from "~/features/cart/types";
import { useCartLineMutations } from "~/features/cart/hooks/use-cart-line-mutations";
import { useCartLineSync } from "~/features/cart/hooks/use-cart-line-sync";
import { useCartPersistence } from "~/features/cart/hooks/use-cart-persistence";
import { applyPendingLineQuantities } from "~/features/cart/lib/cart-display";
import {
  getStoredCartId,
  getStoredCartQuantity,
} from "~/features/cart/lib/cart-id";
import { cartQueries } from "~/features/cart/lib/cart-queries";
import { updateCartLineFn } from "~/features/cart/server/manage-cart";

interface CartStoreProps {
  initialCartQuantity?: number;
  initialCartId?: string | null;
}

function useInternalStore({
  initialCartQuantity = 0,
  initialCartId = null,
}: CartStoreProps) {
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState(
    initialCartId ?? getStoredCartId() ?? null,
  );
  const [storedQuantity, setStoredQuantity] = useState(
    getStoredCartQuantity() || initialCartQuantity,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openTimerIdRef = useRef<number | null>(null);

  const applyServerCart = useCallback(
    (nextCart: Cart) => {
      const previousCartId = cartId;
      const nextQueryKey = cartQueries.detail(nextCart.id).queryKey;
      queryClient.setQueryData(nextQueryKey, nextCart);

      if (previousCartId !== null && previousCartId !== nextCart.id) {
        queryClient.removeQueries({
          queryKey: cartQueries.detail(previousCartId).queryKey,
          exact: true,
        });
      }

      setCartId(nextCart.id);
      setStoredQuantity(nextCart.totalQuantity);
    },
    [cartId, queryClient],
  );

  const refreshCart = useCallback(async () => {
    if (cartId === null) {
      return;
    }

    const nextCart = await queryClient.fetchQuery(cartQueries.detail(cartId));
    if (nextCart === null) {
      setCartId(null);
      setStoredQuantity(0);
      return;
    }
    applyServerCart(nextCart);
  }, [applyServerCart, cartId, queryClient]);

  const updateLineMutation = useMutation({
    mutationKey: ["cart", "line", "update"],
    mutationFn: async (variables: {
      cartId: string;
      lineId: string;
      quantity: number;
    }) => {
      return updateCartLineFn({
        data: {
          cartId: variables.cartId,
          lineId: variables.lineId,
          quantity: variables.quantity,
        },
      });
    },
  });

  const cartQuery = useQuery({
    ...cartQueries.detail(cartId),
    enabled: cartId !== null,
  });

  const serverCart = cartQuery.data ?? null;
  const sync = useCartLineSync({
    cartId,
    serverCart,
    applyServerCart,
    executeUpdateLine: updateLineMutation.mutateAsync,
  });
  const {
    pendingQuantityByLineId,
    lineSyncStatusById,
    hasPendingSync,
    setLineQuantity,
    changeLineQuantity,
    clearLineIntent,
    retryLineNow,
    retryFailedNow,
    flushPending,
    resetSyncState,
  } = sync;
  const { addLine, removeLine } = useCartLineMutations({
    cartId,
    applyServerCart,
    refreshCart,
    clearLineIntent,
  });
  const displayCart = useMemo(
    () => applyPendingLineQuantities(serverCart, pendingQuantityByLineId),
    [pendingQuantityByLineId, serverCart],
  );
  const cartQuantity = useMemo(() => {
    if (displayCart !== null) {
      return displayCart.totalQuantity;
    }
    return storedQuantity;
  }, [displayCart, storedQuantity]);

  const setCartOpen = useCallback((open: boolean) => {
    setIsCartOpen(open);
  }, []);

  const openCartWithDelay = useCallback(
    (delayMs = 500) => {
      if (typeof window === "undefined") {
        setCartOpen(true);
        return;
      }

      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }

      openTimerIdRef.current = window.setTimeout(() => {
        setCartOpen(true);
        openTimerIdRef.current = null;
      }, delayMs);
    },
    [setCartOpen],
  );

  useCartPersistence({
    cartId,
    quantity: cartQuantity,
  });

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
    const latestCart = queryClient.getQueryData<Cart | null>(
      cartQueries.detail(cartId).queryKey,
    );
    if (latestCart !== null) {
      return;
    }
    queueMicrotask(() => {
      const queuedLatestCart = queryClient.getQueryData<Cart | null>(
        cartQueries.detail(cartId).queryKey,
      );
      if (queuedLatestCart !== null) {
        return;
      }
      resetSyncState();
      setCartId((currentCartId) => {
        if (currentCartId !== cartId) {
          return currentCartId;
        }
        return null;
      });
      setStoredQuantity(0);
    });
  }, [cartId, cartQuery.data, cartQuery.status, queryClient, resetSyncState]);

  useEffect(() => {
    if (cartId !== null) {
      return;
    }
    resetSyncState();
  }, [cartId, resetSyncState]);

  useEffect(() => {
    return () => {
      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }
    };
  }, []);

  return {
    cartId,
    cart: displayCart,
    cartQuantity,
    lineSyncStatusById,
    hasPendingSync,
    isPending: hasPendingSync,
    isCartOpen,
    isCartLoading: cartQuery.isLoading,
    setCartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    openCartWithDelay,
    addLine,
    removeLine,
    setLineQuantity,
    changeLineQuantity,
    clearLineIntent,
    retryLineNow,
    retryFailedNow,
    flushPending,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
