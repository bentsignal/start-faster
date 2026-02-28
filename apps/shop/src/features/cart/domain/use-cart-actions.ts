import type { Dispatch } from "react";
import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type {
  CartDomainAction,
  CartDomainState,
} from "~/features/cart/domain/cart-domain-types";
import type { Cart, OptimisticCartLineDraft } from "~/features/cart/types";
import {
  applyOptimisticAdd,
  applyOptimisticRemove,
} from "~/features/cart/domain/cart-domain-reducer";
import { cartQueries } from "~/features/cart/lib/cart-queries";
import {
  addCartLineFn,
  removeCartLineFn,
} from "~/features/cart/server/manage-cart";

interface MutationContext {
  previousCart: Cart | null;
  queryKey: ReturnType<typeof cartQueries.detail>["queryKey"];
}

interface UseCartActionsArgs {
  state: CartDomainState;
  dispatch: Dispatch<CartDomainAction>;
  setCartOpen: (open: boolean) => void;
  openCartWithDelay: (delayMs?: number) => void;
  serverCart: Cart | null;
  sync: {
    setLineQuantity: (lineId: string, quantity: number) => void;
    changeLineQuantity: (lineId: string, delta: number) => void;
    clearLineIntent: (lineId: string) => void;
    retryLineNow: (lineId: string) => void;
    retryFailedNow: () => void;
    flushPending: (options?: { timeoutMs?: number }) => Promise<boolean>;
  };
}

export function useCartActions({
  state,
  dispatch,
  setCartOpen,
  openCartWithDelay,
  serverCart,
  sync,
}: UseCartActionsArgs) {
  const queryClient = useQueryClient();

  const refreshCart = useCallback(async () => {
    if (state.cartId === null) {
      return;
    }

    const nextCart = await queryClient.fetchQuery(
      cartQueries.detail(state.cartId),
    );
    if (nextCart === null) {
      dispatch({ type: "clear-cart" });
      return;
    }

    dispatch({ type: "set-cart-id", cartId: nextCart.id });
    dispatch({ type: "set-stored-quantity", quantity: nextCart.totalQuantity });
  }, [dispatch, queryClient, state.cartId]);

  const addLineMutation = useMutation({
    mutationKey: ["cart", "line", "add"],
    mutationFn: async (variables: {
      merchandiseId: string;
      quantity?: number;
      optimisticLine?: OptimisticCartLineDraft;
    }) => {
      return addCartLineFn({
        data: {
          cartId: state.cartId ?? undefined,
          merchandiseId: variables.merchandiseId,
          quantity: variables.quantity ?? 1,
        },
      });
    },
    onMutate: async (variables) => {
      const activeKey = cartQueries.detail(state.cartId).queryKey;
      await queryClient.cancelQueries({ queryKey: cartQueries.all().queryKey });

      const previousCart =
        queryClient.getQueryData<Cart | null>(activeKey) ?? serverCart ?? null;
      const optimisticCart = applyOptimisticAdd(
        previousCart,
        variables.optimisticLine ?? null,
      );

      if (optimisticCart !== null) {
        queryClient.setQueryData(activeKey, optimisticCart);
      }

      return {
        previousCart,
        queryKey: activeKey,
      } satisfies MutationContext;
    },
    onError: async (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }

      toast.error("Unable to add this item to your cart. Please try again.");
      await refreshCart();
    },
    onSuccess: (nextCart, _variables, context) => {
      const previousKey = context.queryKey;
      const nextKey = cartQueries.detail(nextCart.id).queryKey;
      queryClient.setQueryData(nextKey, nextCart);

      if (previousKey[1] !== nextKey[1]) {
        queryClient.removeQueries({
          queryKey: previousKey,
          exact: true,
        });
      }

      dispatch({ type: "set-cart-id", cartId: nextCart.id });
      dispatch({
        type: "set-stored-quantity",
        quantity: nextCart.totalQuantity,
      });
    },
  });

  const removeLineMutation = useMutation({
    mutationKey: ["cart", "line", "remove"],
    mutationFn: async (variables: { lineId: string }) => {
      if (state.cartId === null) {
        throw new Error("Missing cart ID for line removal.");
      }

      return removeCartLineFn({
        data: {
          cartId: state.cartId,
          lineId: variables.lineId,
        },
      });
    },
    onMutate: async ({ lineId }) => {
      sync.clearLineIntent(lineId);

      const activeKey = cartQueries.detail(state.cartId).queryKey;
      await queryClient.cancelQueries({ queryKey: cartQueries.all().queryKey });
      const previousCart =
        queryClient.getQueryData<Cart | null>(activeKey) ?? serverCart ?? null;
      queryClient.setQueryData(
        activeKey,
        applyOptimisticRemove(previousCart, lineId),
      );

      return {
        previousCart,
        queryKey: activeKey,
      } satisfies MutationContext;
    },
    onError: async (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }
      toast.error("Unable to remove this item from your cart.");
      await refreshCart();
    },
    onSuccess: (nextCart) => {
      const nextKey = cartQueries.detail(nextCart.id).queryKey;
      queryClient.setQueryData(nextKey, nextCart);
      dispatch({ type: "set-cart-id", cartId: nextCart.id });
      dispatch({
        type: "set-stored-quantity",
        quantity: nextCart.totalQuantity,
      });
    },
  });

  const addLine = useCallback(
    (variables: {
      merchandiseId: string;
      quantity?: number;
      optimisticLine?: OptimisticCartLineDraft;
    }) => {
      addLineMutation.mutate(variables);
    },
    [addLineMutation],
  );

  const removeLine = useCallback(
    (lineId: string) => {
      if (state.cartId === null) {
        return;
      }

      removeLineMutation.mutate({ lineId });
    },
    [removeLineMutation, state.cartId],
  );

  return {
    addLine,
    removeLine,
    setLineQuantity: sync.setLineQuantity,
    changeLineQuantity: sync.changeLineQuantity,
    clearLineIntent: sync.clearLineIntent,
    retryLineNow: sync.retryLineNow,
    retryFailedNow: sync.retryFailedNow,
    flushPending: sync.flushPending,
    setCartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    openCartWithDelay,
  };
}
