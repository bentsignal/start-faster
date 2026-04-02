import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { CartMutationContext } from "./cart-mutation-shared";
import { cartMutations } from "~/features/cart/lib/cart-mutations";
import { cartQueries } from "~/features/cart/lib/cart-queries";
import { storeCart } from "~/features/cart/lib/cart-storage";
import { useCartStore } from "~/features/cart/store";

function useInternalUpdateCartLineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    ...cartMutations.lineUpdate(),
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
    ...cartMutations.lineRemove(),
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

export function useUpdateCartLine() {
  const cartId = useCartStore((store) => store.cartId);
  const updateLineMutation = useInternalUpdateCartLineMutation();
  const removeLineMutation = useInternalRemoveCartLineMutation();

  const changeLineQuantity = ({
    lineId,
    currentQuantity,
    delta,
  }: {
    lineId: string;
    currentQuantity: number;
    delta: number;
  }) => {
    if (cartId === null) {
      return;
    }

    const nextQuantity = currentQuantity + delta;
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
