import { useState } from "react";
import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

import { useCartStore } from "../store";

export function CartCheckoutButton() {
  const [navigatingToCheckout, setNavigatingToCheckout] = useState(false);
  const checkoutUrl = useCartStore((store) => store.cart?.checkoutUrl);
  const totalQuantity = useCartStore((store) => store.cartQuantity);
  const cartExists = useCartStore((store) => store.cart !== null);
  const checkForPendingMutations = useCartStore(
    (store) => store.checkForPendingMutations,
  );
  const canCheckout =
    cartExists && totalQuantity > 0 && checkoutUrl && checkoutUrl.length > 0;

  const goToCheckout = async () => {
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
  };

  return (
    <Button
      type="button"
      size="lg"
      className="my-3 w-full rounded-md"
      disabled={canCheckout === false}
      onClick={() => {
        void goToCheckout();
      }}
    >
      {navigatingToCheckout ? (
        <Loader className="size-4 animate-spin" />
      ) : (
        "Go to Checkout"
      )}
    </Button>
  );
}
