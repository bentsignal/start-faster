import type {
  MutationCacheNotifyEvent,
  QueryClient,
} from "@tanstack/react-query";

import type { Cart, CartMutationContext } from "~/features/cart/types";
import { cartMutations } from "~/features/cart/lib/cart-mutations";
import { cartQueries } from "~/features/cart/lib/cart-queries";
import { storeCart } from "~/features/cart/lib/cart-storage";

const CART_LINE_KEY = cartMutations.lineAll().mutationKey;

function isCartLineMutation(key: unknown) {
  return (
    Array.isArray(key) &&
    key.length >= CART_LINE_KEY.length &&
    CART_LINE_KEY.every((segment, i) => key[i] === segment)
  );
}

/**
 * Handles syncing the query cache and localStorage when a cart mutation
 * dispatches its "success" action.
 *
 * This is deliberately done in a MutationCache subscriber (rather than in each
 * mutation's `onSuccess`) so that `setQueryData` is batched inside the same
 * `notifyManager.batch` call as the mutation-state transition. Without this,
 * TanStack Query's lifecycle creates a one-frame gap where the query cache is
 * updated but the mutation is still "pending", causing the optimistic overlay
 * to double-count quantities and prices.
 */
export function handleCartMutationCacheEvent(
  event: MutationCacheNotifyEvent,
  queryClient: QueryClient,
) {
  if (event.type !== "updated" || event.action.type !== "success") {
    return;
  }

  if (!isCartLineMutation(event.mutation.options.mutationKey)) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- mutation data is untyped in cache subscriber; the key check above guarantees this is a cart line mutation
  const nextCart = event.mutation.state.data as Cart | undefined;
  if (nextCart === undefined) {
    return;
  }

  queryClient.setQueryData(cartQueries.detail(nextCart.id).queryKey, nextCart);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- context is untyped in cache subscriber; all cart mutation onMutate handlers return CartMutationContext (enforced via satisfies)
  const context = event.mutation.state.context as
    | CartMutationContext
    | undefined;
  if (
    context?.previousCartId != null &&
    context.previousCartId !== nextCart.id
  ) {
    queryClient.removeQueries({
      queryKey: cartQueries.detail(context.previousCartId).queryKey,
      exact: true,
    });
  }

  storeCart(nextCart);
}
