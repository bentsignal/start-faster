import type { Cart } from "~/features/cart/types";
import { applyOptimisticQuantityUpdate } from "~/features/cart/lib/optimistic-cart";

export function applyPendingLineQuantities(
  serverCart: Cart | null,
  pendingQuantityByLineId: Record<string, number>,
) {
  let nextCart = serverCart;
  for (const [lineId, quantity] of Object.entries(pendingQuantityByLineId)) {
    nextCart = applyOptimisticQuantityUpdate(nextCart, lineId, quantity);
  }
  return nextCart;
}
