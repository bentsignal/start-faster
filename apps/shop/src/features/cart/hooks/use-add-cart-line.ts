import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import type { CartMutationContext } from "~/features/cart/types";
import { cartMutations } from "~/features/cart/lib/cart-mutations";
import { cartQueries } from "~/features/cart/lib/cart-queries";
import { clearStoredCartQuantity } from "~/features/cart/lib/cart-storage";

export function useAddCartLineMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    ...cartMutations.lineAdd(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: cartQueries.detailAll().queryKey,
      });

      return {
        previousCartId: variables.cartId ?? null,
      } satisfies CartMutationContext;
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCartId === null) {
        clearStoredCartQuantity();
      }
      toast.error("Unable to add this item to your cart. Please try again.");
    },
  });
}
