import type { CartDomainState } from "./cart-domain-types";
import type { Cart, CartLineIntent } from "~/features/cart/types";
import { applyOptimisticQuantityUpdate } from "~/features/cart/lib/optimistic-cart";

function getOrderedIntents(intentsByLineId: Record<string, CartLineIntent>) {
  return Object.entries(intentsByLineId)
    .map(([lineId, intent]) => ({ lineId, intent }))
    .sort((left, right) => left.intent.updatedAt - right.intent.updatedAt);
}

export function selectDisplayCart(
  state: CartDomainState,
  serverCart: Cart | null,
) {
  let nextCart = serverCart;

  for (const { lineId, intent } of getOrderedIntents(state.lineIntentsById)) {
    nextCart = applyOptimisticQuantityUpdate(
      nextCart,
      lineId,
      intent.desiredQuantity,
    );
  }

  return nextCart;
}

export function selectCartQuantity(
  state: CartDomainState,
  displayCart: Cart | null,
) {
  if (displayCart !== null) {
    return displayCart.totalQuantity;
  }

  return state.storedQuantity;
}

export function selectHasPendingSync(state: CartDomainState) {
  return Object.keys(state.lineSyncStatusById).length > 0;
}
