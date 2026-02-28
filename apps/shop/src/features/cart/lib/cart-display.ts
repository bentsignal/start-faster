import type { Cart } from "~/features/cart/types";
import {
  applyOptimisticQuantityUpdate,
  applyOptimisticRemove,
} from "~/features/cart/lib/optimistic-cart";

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

export function applyPendingCartIntents(
  serverCart: Cart | null,
  pendingQuantityByLineId: Record<string, number>,
  pendingRemovedLineIds: ReadonlySet<string>,
) {
  let nextCart = applyPendingLineQuantities(
    serverCart,
    pendingQuantityByLineId,
  );
  for (const lineId of pendingRemovedLineIds) {
    nextCart = applyOptimisticRemove(nextCart, lineId);
  }
  return nextCart;
}
