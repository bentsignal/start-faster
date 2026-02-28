import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStore } from "rostra";

import type { Cart } from "~/features/cart/types";
import {
  cartDomainReducer,
  createInitialCartDomainState,
} from "~/features/cart/domain/cart-domain-reducer";
import {
  selectCartQuantity,
  selectDisplayCart,
  selectHasPendingSync,
} from "~/features/cart/domain/cart-domain-selectors";
import { useCartActions } from "~/features/cart/domain/use-cart-actions";
import { useCartPersistence } from "~/features/cart/domain/use-cart-persistence";
import { useCartSync } from "~/features/cart/domain/use-cart-sync";
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
  const [state, dispatch] = useReducer(
    cartDomainReducer,
    {
      cartId: initialCartId ?? getStoredCartId() ?? null,
      storedQuantity: getStoredCartQuantity() || initialCartQuantity,
    },
    createInitialCartDomainState,
  );

  const openTimerIdRef = useRef<number | null>(null);
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
    ...cartQueries.detail(state.cartId),
    enabled: state.cartId !== null,
  });

  const serverCart = cartQuery.data ?? null;
  const displayCart = useMemo(
    () => selectDisplayCart(state, serverCart),
    [serverCart, state],
  );
  const cartQuantity = useMemo(
    () => selectCartQuantity(state, displayCart),
    [displayCart, state],
  );
  const hasPendingSync = useMemo(() => selectHasPendingSync(state), [state]);

  const setCartOpen = useCallback((open: boolean) => {
    dispatch({ type: "set-cart-open", open });
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

  const applyServerCart = useCallback(
    (nextCart: Cart) => {
      const previousCartId = state.cartId;
      const nextKey = cartQueries.detail(nextCart.id).queryKey;
      queryClient.setQueryData(nextKey, nextCart);

      if (previousCartId !== null && previousCartId !== nextCart.id) {
        queryClient.removeQueries({
          queryKey: cartQueries.detail(previousCartId).queryKey,
          exact: true,
        });
      }

      dispatch({ type: "set-cart-id", cartId: nextCart.id });
      dispatch({
        type: "set-stored-quantity",
        quantity: nextCart.totalQuantity,
      });
    },
    [queryClient, state.cartId],
  );

  const sync = useCartSync({
    state,
    dispatch,
    displayCart,
    applyServerCart,
    executeUpdateLine: updateLineMutation.mutateAsync,
  });

  const actions = useCartActions({
    state,
    dispatch,
    setCartOpen,
    openCartWithDelay,
    serverCart,
    sync,
  });

  useCartPersistence({
    cartId: state.cartId,
    quantity: cartQuantity,
  });

  useEffect(() => {
    if (state.cartId === null) {
      return;
    }

    if (cartQuery.status !== "success") {
      return;
    }

    if (cartQuery.data !== null) {
      return;
    }

    dispatch({ type: "clear-cart" });
  }, [cartQuery.data, cartQuery.status, state.cartId]);

  useEffect(() => {
    if (serverCart === null) {
      return;
    }

    dispatch({ type: "set-cart-id", cartId: serverCart.id });
    dispatch({
      type: "set-stored-quantity",
      quantity: serverCart.totalQuantity,
    });
  }, [serverCart]);

  useEffect(() => {
    return () => {
      if (openTimerIdRef.current !== null) {
        window.clearTimeout(openTimerIdRef.current);
      }
    };
  }, []);

  return {
    cartId: state.cartId,
    cart: displayCart,
    cartQuantity,
    lineSyncStatusById: state.lineSyncStatusById,
    hasPendingSync,
    isPending: hasPendingSync,
    isCartOpen: state.isCartOpen,
    isCartLoading: cartQuery.isLoading,
    setCartOpen,
    openCart: actions.openCart,
    closeCart: actions.closeCart,
    openCartWithDelay,
    addLine: actions.addLine,
    removeLine: actions.removeLine,
    setLineQuantity: actions.setLineQuantity,
    changeLineQuantity: actions.changeLineQuantity,
    clearLineIntent: actions.clearLineIntent,
    retryLineNow: actions.retryLineNow,
    retryFailedNow: actions.retryFailedNow,
    flushPending: actions.flushPending,
  };
}

const { Store: CartStore, useStore: useCartStore } =
  createStore(useInternalStore);

export { CartStore, useCartStore };
