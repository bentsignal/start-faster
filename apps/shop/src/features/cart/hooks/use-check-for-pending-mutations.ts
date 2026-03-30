import { useQueryClient } from "@tanstack/react-query";

import { cartMutationKeys } from "~/features/cart/lib/cart-queries";

const CHECKOUT_SYNC_POLL_INTERVAL_MS = 50;

export function useCheckForPendingMutations() {
  const queryClient = useQueryClient();

  return async (options?: { timeoutMs?: number }) => {
    const timeoutMs = options?.timeoutMs ?? 8000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const activeMutations = queryClient.isMutating({
        mutationKey: cartMutationKeys.lineAll,
      });

      if (activeMutations === 0) {
        return true;
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, CHECKOUT_SYNC_POLL_INTERVAL_MS);
      });
    }
    return false;
  };
}
