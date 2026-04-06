import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { CartMutationContext } from "~/features/cart/types";
import { useCartStore } from "~/features/cart/cart-store";
import { cartMutations } from "~/features/cart/lib/cart-mutations";
import { cartQueries } from "~/features/cart/lib/cart-queries";

function useInternalUpdateCartLineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    ...cartMutations.lineUpdate(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: cartQueries.detailAll().queryKey,
      });

      return {
        previousCartId: variables.cartId,
      } satisfies CartMutationContext;
    },
    onError: () => {
      toast.error("Unable to update cart quantity.");
    },
  });
}

function useInternalRemoveCartLineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    ...cartMutations.lineRemove(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: cartQueries.detailAll().queryKey,
      });

      return {
        previousCartId: variables.cartId,
      } satisfies CartMutationContext;
    },
    onError: () => {
      toast.error("Unable to remove this item from your cart.");
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
