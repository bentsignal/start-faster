import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { CartMutationContext } from "./cart-mutation-shared";
import type { Cart } from "~/features/cart/types";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
import { storeCart } from "~/features/cart/lib/cart-storage";
import {
  removeCartLineFn,
  updateCartLineFn,
} from "~/features/cart/lib/manage-cart";
import { CART_WRITE_SCOPE_ID } from "./cart-mutation-shared";

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

export function useUpdateCartLine({
  cartId,
  cart,
}: {
  cartId: string | null;
  cart: Cart | null;
}) {
  const updateLineMutation = useInternalUpdateCartLineMutation();
  const removeLineMutation = useInternalRemoveCartLineMutation();

  const changeLineQuantity = ({
    lineId,
    delta,
  }: {
    lineId: string;
    delta: number;
  }) => {
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
  };

  return {
    changeLineQuantity,
  };
}
