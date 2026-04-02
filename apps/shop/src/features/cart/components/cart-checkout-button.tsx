import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

import { useCartStore } from "~/features/cart/store";
import { cartMutations } from "../lib/cart-mutations";

// we want to make sure that all cart mutations finish before we redirect to checkout
function useCheckForPendingMutations() {
  const queryClient = useQueryClient();
  const CHECKOUT_SYNC_POLL_INTERVAL_MS = 50;

  return async (options?: { timeoutMs?: number }) => {
    const timeoutMs = options?.timeoutMs ?? 8000;
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
      const activeMutations = queryClient.isMutating({
        mutationKey: cartMutations.lineAll().mutationKey,
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

function useCartCheckout() {
  const [navigatingToCheckout, setNavigatingToCheckout] = useState(false);
  const checkoutUrl = useCartStore((store) => store.checkoutUrl);
  const cartQuantity = useCartStore((store) => store.cartQuantity);
  const checkForPendingMutations = useCheckForPendingMutations();

  const canCheckout =
    checkoutUrl !== null && cartQuantity > 0 && checkoutUrl.length > 0;

  async function goToCheckout() {
    if (navigatingToCheckout) {
      return;
    }

    if (canCheckout === false) {
      return;
    }

    setNavigatingToCheckout(true);

    const shouldProceedToCheckout = await checkForPendingMutations({
      timeoutMs: 8000,
    });
    if (shouldProceedToCheckout === false) {
      setNavigatingToCheckout(false);
      toast.error(
        "We're having trouble updating your cart. Please refresh and try again.",
      );
      return;
    }

    window.location.assign(checkoutUrl);
  }

  return { navigatingToCheckout, canCheckout, goToCheckout };
}

export function CartCheckoutButton() {
  const { navigatingToCheckout, canCheckout, goToCheckout } = useCartCheckout();

  return (
    <Button
      type="button"
      size="lg"
      className="my-3 w-full rounded-md"
      disabled={canCheckout === false}
      onClick={goToCheckout}
    >
      {navigatingToCheckout ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        "Go to Checkout"
      )}
    </Button>
  );
}
