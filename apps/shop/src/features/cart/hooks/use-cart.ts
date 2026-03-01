import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { OptimisticCartLineDraft } from "~/features/cart/types";
import {
  useAddCartLineMutation,
  useRemoveCartLineMutation,
  useUpdateCartLineMutation,
} from "~/features/cart/hooks/use-cart-mutations";
import { cartMutationKeys } from "~/features/cart/lib/cart-queries";
import { useCartStore } from "../store";

const CHECKOUT_SYNC_POLL_INTERVAL_MS = 50;

export function useAddCartLine() {
  const cartId = useCartStore((store) => store.cartId);
  const addLineMutation = useAddCartLineMutation();

  return {
    mutate: (variables: {
      merchandiseId: string;
      quantity?: number;
      optimisticLine?: OptimisticCartLineDraft;
    }) => {
      addLineMutation.mutate({
        ...variables,
        cartId: cartId ?? undefined,
      });
    },
  };
}

export function useUpdateCartLine() {
  const queryClient = useQueryClient();
  const cartId = useCartStore((store) => store.cartId);
  const cart = useCartStore((store) => store.cart);
  const updateLineMutation = useUpdateCartLineMutation();
  const removeLineMutation = useRemoveCartLineMutation();

  const changeLineQuantity = useCallback(
    ({ lineId, delta }: { lineId: string; delta: number }) => {
      const cartLine = cart?.lines.nodes.find((line) => line.id === lineId);
      if (cartLine === undefined || cartId === null) {
        return;
      }

      const nextQuantity = cartLine.quantity + delta;
      if (nextQuantity <= 0) {
        removeLineMutation.mutate({
          cartId,
          lineId,
        });
        return;
      }

      updateLineMutation.mutate({
        cartId,
        lineId,
        quantity: nextQuantity,
      });
    },
    [cart, cartId, removeLineMutation, updateLineMutation],
  );

  const flushPending = useCallback(
    async (options?: { timeoutMs?: number }) => {
      const timeoutMs = options?.timeoutMs ?? 8000;
      const deadline = Date.now() + timeoutMs;

      while (Date.now() < deadline) {
        const activeMutations = queryClient.isMutating({
          mutationKey: cartMutationKeys.lineAll,
        });

        if (activeMutations === 0) {
          return true;
        }

        await new Promise((resolve) => {
          window.setTimeout(resolve, CHECKOUT_SYNC_POLL_INTERVAL_MS);
        });
      }

      return false;
    },
    [queryClient],
  );

  return {
    changeLineQuantity,
    flushPending,
  };
}
