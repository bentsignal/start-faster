import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { Cart, OptimisticCartLineDraft } from "~/features/cart/types";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
import {
  applyOptimisticAdd,
  applyOptimisticRemove,
} from "~/features/cart/lib/optimistic-cart";
import {
  addCartLineFn,
  removeCartLineFn,
} from "~/features/cart/server/manage-cart";

interface UseCartLineMutationsArgs {
  cartId: string | null;
  applyServerCart: (nextCart: Cart) => void;
  refreshCart: () => Promise<void>;
  clearLineIntent: (lineId: string) => void;
}

export function useCartLineMutations({
  cartId,
  applyServerCart,
  refreshCart,
  clearLineIntent,
}: UseCartLineMutationsArgs) {
  const queryClient = useQueryClient();

  const addLineMutation = useMutation({
    mutationKey: cartMutationKeys.lineAdd,
    mutationFn: async (variables: {
      cartId?: string;
      merchandiseId: string;
      quantity?: number;
      optimisticLine?: OptimisticCartLineDraft;
    }) => {
      return addCartLineFn({
        data: {
          cartId: variables.cartId,
          merchandiseId: variables.merchandiseId,
          quantity: variables.quantity ?? 1,
        },
      });
    },
    onMutate: async (variables) => {
      const activeQueryKey = cartQueries.detail(
        variables.cartId ?? null,
      ).queryKey;
      await queryClient.cancelQueries({
        queryKey: cartQueries.detailAll().queryKey,
      });
      const previousCart =
        queryClient.getQueryData<Cart | null>(activeQueryKey) ?? null;
      const optimisticCart = applyOptimisticAdd(
        previousCart,
        variables.optimisticLine ?? null,
      );
      if (optimisticCart !== null) {
        queryClient.setQueryData(activeQueryKey, optimisticCart);
      }

      return {
        previousCart,
        queryKey: activeQueryKey,
        previousCartId: variables.cartId ?? null,
      };
    },
    onError: async (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }
      toast.error("Unable to add this item to your cart. Please try again.");
      await refreshCart();
    },
    onSuccess: (nextCart, _variables, context) => {
      const previousQueryKey = context.queryKey;
      const nextQueryKey = cartQueries.detail(nextCart.id).queryKey;
      queryClient.setQueryData(nextQueryKey, nextCart);
      if (
        context.previousCartId !== null &&
        context.previousCartId !== nextCart.id
      ) {
        queryClient.removeQueries({
          queryKey: previousQueryKey,
          exact: true,
        });
      }
      applyServerCart(nextCart);
    },
  });

  const removeLineMutation = useMutation({
    mutationKey: cartMutationKeys.lineRemove,
    mutationFn: async (variables: { cartId: string; lineId: string }) => {
      return removeCartLineFn({
        data: {
          cartId: variables.cartId,
          lineId: variables.lineId,
        },
      });
    },
    onMutate: async ({ lineId, cartId: activeCartId }) => {
      clearLineIntent(lineId);
      const activeQueryKey = cartQueries.detail(activeCartId).queryKey;
      await queryClient.cancelQueries({
        queryKey: cartQueries.detailAll().queryKey,
      });
      const previousCart =
        queryClient.getQueryData<Cart | null>(activeQueryKey) ?? null;
      queryClient.setQueryData(
        activeQueryKey,
        applyOptimisticRemove(previousCart, lineId),
      );

      return {
        previousCart,
        queryKey: activeQueryKey,
      };
    },
    onError: async (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previousCart);
      }
      toast.error("Unable to remove this item from your cart.");
      await refreshCart();
    },
    onSuccess: (nextCart) => {
      applyServerCart(nextCart);
    },
  });

  const addLine = useCallback(
    (variables: {
      merchandiseId: string;
      quantity?: number;
      optimisticLine?: OptimisticCartLineDraft;
    }) => {
      addLineMutation.mutate({
        ...variables,
        cartId: cartId ?? undefined,
      });
    },
    [addLineMutation, cartId],
  );

  const removeLine = useCallback(
    (lineId: string) => {
      if (cartId === null) {
        return;
      }
      removeLineMutation.mutate({
        cartId,
        lineId,
      });
    },
    [cartId, removeLineMutation],
  );

  return {
    addLine,
    removeLine,
  };
}
