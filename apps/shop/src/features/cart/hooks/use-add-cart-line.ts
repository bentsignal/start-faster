import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { CartMutationContext } from "./cart-mutation-shared";
import type { OptimisticCartLineDraft } from "~/features/cart/types";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
import {
  clearStoredCartQuantity,
  storeCart,
} from "~/features/cart/lib/cart-storage";
import { addCartLineFn } from "~/features/cart/lib/manage-cart";
import { CART_WRITE_SCOPE_ID } from "./cart-mutation-shared";

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
