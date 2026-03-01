import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { Cart, OptimisticCartLineDraft } from "~/features/cart/types";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
import {
  clearStoredCartId,
  clearStoredCartQuantity,
  storeCart,
} from "~/features/cart/lib/cart-storage";
import {
  addCartLineFn,
  removeCartLineFn,
  updateCartLineFn,
} from "~/features/cart/server/manage-cart";

const CART_WRITE_SCOPE_ID = "cart-write";

interface CartMutationContext {
  queryKey: ReturnType<typeof cartQueries.detail>["queryKey"];
  previousCartId: string | null;
}

const CHECKOUT_SYNC_POLL_INTERVAL_MS = 50;

// this hook should only be used in the cart store, not directly in components. use the cart store instead.
export function useAddCartLine({ cartId }: { cartId: string | null }) {
  const addLineMutation = useInternalAddCartLineMutation();

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

// this hook should only be used in the cart store, not directly in components. use the cart store instead.
export function useUpdateCartLine({
  cartId,
  cart,
}: {
  cartId: string | null;
  cart: Cart | null;
}) {
  const updateLineMutation = useInternalUpdateCartLineMutation();
  const removeLineMutation = useInternalRemoveCartLineMutation();

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

  return {
    changeLineQuantity,
  };
}

// this hook should only be used in the cart store, not directly in components. use the cart store instead.
export function useCheckForPendingMutations() {
  const queryClient = useQueryClient();

  return async (options?: { timeoutMs?: number }) => {
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
  };
}

function useInternalAddCartLineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: cartMutationKeys.lineAdd,
    scope: {
      id: CART_WRITE_SCOPE_ID,
    },
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
    onMutate: async (variables): Promise<CartMutationContext> => {
      const activeQueryKey = cartQueries.detail(
        variables.cartId ?? null,
      ).queryKey;
      await queryClient.cancelQueries({
        queryKey: cartQueries.detailAll().queryKey,
      });

      return {
        queryKey: activeQueryKey,
        previousCartId: variables.cartId ?? null,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCartId === null) {
        clearStoredCartQuantity();
      }
      toast.error("Unable to add this item to your cart. Please try again.");
    },
    onSuccess: (nextCart, _variables, context) => {
      const nextQueryKey = cartQueries.detail(nextCart.id).queryKey;
      queryClient.setQueryData(nextQueryKey, nextCart);

      if (
        context.previousCartId !== null &&
        context.previousCartId !== nextCart.id
      ) {
        queryClient.removeQueries({
          queryKey: context.queryKey,
          exact: true,
        });
      }

      storeCart(nextCart);
    },
  });
}

function useInternalUpdateCartLineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: cartMutationKeys.lineUpdate,
    scope: {
      id: CART_WRITE_SCOPE_ID,
    },
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
    onMutate: async (variables): Promise<CartMutationContext> => {
      const activeQueryKey = cartQueries.detail(variables.cartId).queryKey;
      await queryClient.cancelQueries({
        queryKey: cartQueries.detailAll().queryKey,
      });

      return {
        queryKey: activeQueryKey,
        previousCartId: variables.cartId,
      };
    },
    onError: () => {
      toast.error("Unable to update cart quantity.");
    },
    onSuccess: (nextCart) => {
      const nextQueryKey = cartQueries.detail(nextCart.id).queryKey;
      queryClient.setQueryData(nextQueryKey, nextCart);
      storeCart(nextCart);
    },
  });
}

function useInternalRemoveCartLineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: cartMutationKeys.lineRemove,
    scope: {
      id: CART_WRITE_SCOPE_ID,
    },
    mutationFn: async (variables: { cartId: string; lineId: string }) => {
      return removeCartLineFn({
        data: {
          cartId: variables.cartId,
          lineId: variables.lineId,
        },
      });
    },
    onMutate: async (variables): Promise<CartMutationContext> => {
      const activeQueryKey = cartQueries.detail(variables.cartId).queryKey;
      await queryClient.cancelQueries({
        queryKey: cartQueries.detailAll().queryKey,
      });

      return {
        queryKey: activeQueryKey,
        previousCartId: variables.cartId,
      };
    },
    onError: () => {
      toast.error("Unable to remove this item from your cart.");
    },
    onSuccess: (nextCart) => {
      const nextQueryKey = cartQueries.detail(nextCart.id).queryKey;
      queryClient.setQueryData(nextQueryKey, nextCart);
      storeCart(nextCart);
    },
  });
}

export function clearCartStorage() {
  clearStoredCartId();
  clearStoredCartQuantity();
}
