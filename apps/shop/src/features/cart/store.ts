import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStore } from "rostra";

import type { CartCookieState } from "~/features/cart/server/cart-cookie";
import type { Cart } from "~/features/cart/types";
import { useCartLineMutations } from "~/features/cart/hooks/use-cart-line-mutations";
import { useCartLineSync } from "~/features/cart/hooks/use-cart-line-sync";
import { useCartPersistence } from "~/features/cart/hooks/use-cart-persistence";
import { applyPendingCartIntents } from "~/features/cart/lib/cart-display";
import {
  getStoredCartId,
  getStoredCartQuantity,
} from "~/features/cart/lib/cart-id";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
import { updateCartLineFn } from "~/features/cart/server/manage-cart";

interface CartStoreProps {
  initialCart?: CartCookieState;
}

const CHECKOUT_SYNC_POLL_INTERVAL_MS = 50;

function useInternalStore({
  initialCart = { id: null, quantity: 0 },
}: CartStoreProps) {
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState(
    initialCart.id ?? getStoredCartId() ?? null,
  );
  const [storedQuantity, setStoredQuantity] = useState(
    getStoredCartQuantity() || initialCart.quantity,
  );
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pendingRemovedLineIds, setPendingRemovedLineIds] = useState<
    Set<string>
  >(new Set());

  const openTimerIdRef = useRef<number | null>(null);
  const pendingQuantityByLineIdRef = useRef<Record<string, number>>({});
  const pendingRemovedLineIdsRef = useRef<Set<string>>(new Set());
  const hasPendingRemoveSyncRef = useRef(false);

  const markLinePendingRemoval = useCallback((lineId: string) => {
    setPendingRemovedLineIds((previousRemovedLineIds) => {
      if (previousRemovedLineIds.has(lineId)) {
        return previousRemovedLineIds;
      }
      const nextRemovedLineIds = new Set(previousRemovedLineIds);
      nextRemovedLineIds.add(lineId);
      return nextRemovedLineIds;
    });
  }, []);

  const clearPendingRemoval = useCallback((lineId: string) => {
    setPendingRemovedLineIds((previousRemovedLineIds) => {
      if (previousRemovedLineIds.has(lineId) === false) {
        return previousRemovedLineIds;
      }
      const nextRemovedLineIds = new Set(previousRemovedLineIds);
      nextRemovedLineIds.delete(lineId);
      return nextRemovedLineIds;
    });
  }, []);

  const clearAllPendingRemovals = useCallback(() => {
    setPendingRemovedLineIds((previousRemovedLineIds) => {
      if (previousRemovedLineIds.size === 0) {
        return previousRemovedLineIds;
      }
      return new Set();
    });
  }, []);

  const reconcileCart = useCallback((nextCart: Cart) => {
    return applyPendingCartIntents(
      nextCart,
      pendingQuantityByLineIdRef.current,
      pendingRemovedLineIdsRef.current,
    );
  }, []);

  const applyServerCart = useCallback(
    (nextCart: Cart) => {
      const previousCartId = cartId;
      const reconciledCart = reconcileCart(nextCart) ?? nextCart;
      const nextQueryKey = cartQueries.detail(reconciledCart.id).queryKey;
      queryClient.setQueryData(nextQueryKey, reconciledCart);

      if (previousCartId !== null && previousCartId !== reconciledCart.id) {
        clearAllPendingRemovals();
        queryClient.removeQueries({
          queryKey: cartQueries.detail(previousCartId).queryKey,
          exact: true,
        });
      }

      setCartId(reconciledCart.id);
      setStoredQuantity(reconciledCart.totalQuantity);
    },
    [cartId, clearAllPendingRemovals, queryClient, reconcileCart],
  );

  const refreshCart = useCallback(async () => {
    if (cartId === null) {
      return;
    }

    const nextCart = await queryClient.fetchQuery(cartQueries.detail(cartId));
    if (nextCart === null) {
      clearAllPendingRemovals();
      setCartId(null);
      setStoredQuantity(0);
      return;
    }
    applyServerCart(nextCart);
  }, [applyServerCart, cartId, clearAllPendingRemovals, queryClient]);

  const updateLineMutation = useMutation({
    mutationKey: cartMutationKeys.lineUpdate,
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
  const { addLine, removeLine, hasPendingRemoveSync } = useCartLineMutations({
    cartId,
    applyServerCart,
    refreshCart,
    clearLineIntent,
    markLinePendingRemoval,
    clearPendingRemoval,
  });

  useEffect(() => {
    pendingQuantityByLineIdRef.current = pendingQuantityByLineId;
  }, [pendingQuantityByLineId]);

  useEffect(() => {
    pendingRemovedLineIdsRef.current = pendingRemovedLineIds;
  }, [pendingRemovedLineIds]);

  useEffect(() => {
    hasPendingRemoveSyncRef.current = hasPendingRemoveSync;
  }, [hasPendingRemoveSync]);

  const displayCart = useMemo(
    () =>
      applyPendingCartIntents(
        serverCart,
        pendingQuantityByLineId,
        pendingRemovedLineIds,
      ),
    [pendingQuantityByLineId, pendingRemovedLineIds, serverCart],
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

  const flushPendingCartUpdates = useCallback(
    async (options?: { timeoutMs?: number }) => {
      const timeoutMs = options?.timeoutMs;
      const didFlushLineSync = await flushPending({
        timeoutMs,
      });
      if (didFlushLineSync === false) {
        return false;
      }

      const deadline = Date.now() + (timeoutMs ?? 8000);
      while (Date.now() < deadline) {
        if (
          pendingRemovedLineIdsRef.current.size === 0 &&
          hasPendingRemoveSyncRef.current === false
        ) {
          return true;
        }
        await new Promise((resolve) => {
          window.setTimeout(resolve, CHECKOUT_SYNC_POLL_INTERVAL_MS);
        });
      }

      return false;
    },
    [flushPending],
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
      clearAllPendingRemovals();
      setCartId((currentCartId) => {
        if (currentCartId !== cartId) {
          return currentCartId;
        }
        return null;
      });
      setStoredQuantity(0);
    });
  }, [
    cartId,
    cartQuery.data,
    cartQuery.status,
    clearAllPendingRemovals,
    queryClient,
    resetSyncState,
  ]);

  useEffect(() => {
    return () => {
      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }
    };
  }, []);

  const hasPendingCartSync =
    hasPendingSync || hasPendingRemoveSync || pendingRemovedLineIds.size > 0;

  return {
    cartId,
    cart: displayCart,
    cartQuantity,
    lineSyncStatusById,
    hasPendingSync,
    hasPendingCartSync,
    isPending: hasPendingCartSync,
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
    flushPending: flushPendingCartUpdates,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
