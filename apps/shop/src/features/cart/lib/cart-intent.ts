import type {
  Cart,
  CartLineIntent,
  CartLineSyncStatus,
} from "~/features/cart/types";
import { applyOptimisticQuantityUpdate } from "~/features/cart/lib/optimistic-cart";

export function applyIntentToCart(
  cart: Cart | null,
  intents: ReadonlyMap<string, CartLineIntent>,
) {
  let nextCart = cart;

  for (const [lineId, intent] of intents.entries()) {
    nextCart = applyOptimisticQuantityUpdate(
      nextCart,
      lineId,
      intent.desiredQuantity,
    );
  }

  return nextCart;
}

interface UpsertIntentArgs {
  lineId: string;
  desiredQuantity: number;
  status?: Exclude<CartLineSyncStatus, "idle">;
}

export function upsertIntent(
  intents: Map<string, CartLineIntent>,
  args: UpsertIntentArgs,
) {
  const previousIntent = intents.get(args.lineId);
  const nextIntent: CartLineIntent = {
    desiredQuantity: args.desiredQuantity,
    version: (previousIntent?.version ?? 0) + 1,
    status: args.status ?? "queued",
    retryCount: 0,
    updatedAt: Date.now(),
  };

  intents.set(args.lineId, nextIntent);

  return nextIntent;
}

export function setIntentStatus(
  intents: Map<string, CartLineIntent>,
  lineId: string,
  status: Exclude<CartLineSyncStatus, "idle">,
  retryCount?: number,
) {
  const previousIntent = intents.get(lineId);
  if (previousIntent === undefined) {
    return undefined;
  }

  const nextIntent: CartLineIntent = {
    ...previousIntent,
    status,
    retryCount: retryCount ?? previousIntent.retryCount,
    updatedAt: Date.now(),
  };

  intents.set(lineId, nextIntent);
  return nextIntent;
}

export function ackIntentIfCurrent(
  intents: Map<string, CartLineIntent>,
  lineId: string,
  sentVersion: number,
) {
  const latestIntent = intents.get(lineId);
  if (latestIntent?.version !== sentVersion) {
    return false;
  }

  intents.delete(lineId);
  return true;
}

export function clearIntent(
  intents: Map<string, CartLineIntent>,
  lineId: string,
) {
  intents.delete(lineId);
}

export function nextRetryDelay(retryCount: number) {
  return Math.min(1000 * 2 ** retryCount, 30_000);
}
