import { useEffect } from "react";
import { useMutationState, useQuery } from "@tanstack/react-query";

import { clearCartStorage } from "~/features/cart/hooks/cart-mutation-shared";
import {
  applyPendingMutationsToCart,
  parsePendingCartMutation,
} from "~/features/cart/lib/cart-pending-mutations";
import {
  cartMutationKeys,
  cartQueries,
} from "~/features/cart/lib/cart-queries";
import {
  getStoredCartId,
  getStoredCartQuantity,
} from "~/features/cart/lib/cart-storage";

function getFallbackQuantity(
  cartId: string | null,
  cookieData: { quantity?: number } | undefined,
) {
  if (cartId === null) return 0;
  const stored = getStoredCartQuantity();
  return stored > 0 ? stored : (cookieData?.quantity ?? 0);
}

export function useCart() {
  const cookieCartQuery = useQuery({
    ...cartQueries.cookie(),
  });

  const cartId = getStoredCartId() ?? cookieCartQuery.data?.id ?? null;

  const cartQuery = useQuery({
    ...cartQueries.detail(cartId),
    enabled: cartId !== null,
  });

  const pendingMutations = useMutationState({
    filters: {
      mutationKey: cartMutationKeys.lineAll,
      status: "pending",
    },
    select: parsePendingCartMutation,
  }).filter((mutation) => mutation !== null);

  const cart = applyPendingMutationsToCart(
    cartQuery.data ?? null,
    pendingMutations,
  );
  const cartQuantity =
    cart?.totalQuantity ?? getFallbackQuantity(cartId, cookieCartQuery.data);

  // eslint-disable-next-line no-restricted-syntax -- syncs query result with external localStorage state
  useEffect(() => {
    if (cartId === null) {
      return;
    }

    if (cartQuery.status !== "success") {
      return;
    }

    if (cartQuery.data !== null) {
      return;
    }

    clearCartStorage();
  }, [cartId, cartQuery.data, cartQuery.status]);

  return {
    cartId,
    cart,
    cartQuantity,
    cartQuery,
  };
}
