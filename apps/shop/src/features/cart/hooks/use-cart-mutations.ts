import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { Cart, OptimisticCartLineDraft } from "~/features/cart/types";
import {
  clearStoredCartId,
  clearStoredCartQuantity,
  setStoredCartId,
  setStoredCartQuantity,
} from "~/features/cart/lib/cart-id";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
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

function setCartStorageFromCart(cart: Cart) {
  setStoredCartId(cart.id);
  setStoredCartQuantity(cart.totalQuantity);
}

export function useAddCartLineMutation() {
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

      setCartStorageFromCart(nextCart);
    },
  });
}

export function useUpdateCartLineMutation() {
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
      setCartStorageFromCart(nextCart);
    },
  });
}

export function useRemoveCartLineMutation() {
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
      setCartStorageFromCart(nextCart);
    },
  });
}

export function clearCartStorage() {
  clearStoredCartId();
  clearStoredCartQuantity();
}
