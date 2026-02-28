import { useState } from "react";
import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

import type { Cart } from "~/features/cart/types";
import { formatPrice } from "~/features/product/lib/price";

interface CartSummaryProps {
  cart: Cart | null;
  flushPendingCartUpdates: (options?: {
    timeoutMs?: number;
  }) => Promise<boolean>;
}

export function CartSummary({
  cart,
  flushPendingCartUpdates,
}: CartSummaryProps) {
  const [navigatingToCheckout, setNavigatingToCheckout] = useState(false);
  const totalAmount = cart?.cost.totalAmount;
  const totalLabel =
    totalAmount === undefined
      ? formatPrice(0, "USD")
      : formatPrice(totalAmount.amount, totalAmount.currencyCode);
  const canCheckout =
    cart !== null && cart.totalQuantity > 0 && cart.checkoutUrl.length > 0;

  const goToCheckout = async () => {
    if (navigatingToCheckout) {
      return;
    }

    if (canCheckout === false) {
      return;
    }

    setNavigatingToCheckout(true);

    const didFlush = await flushPendingCartUpdates({
      timeoutMs: 8000,
    });
    if (didFlush === false) {
      setNavigatingToCheckout(false);
      toast.error(
        "We're having trouble updating your cart. Please refresh and try again.",
      );
      return;
    }

    window.location.assign(cart.checkoutUrl);
  };

  return (
    <footer className="border-t p-4 sm:p-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium tabular-nums">{totalLabel}</span>
      </div>
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
      <p className="text-muted-foreground text-xs">
        Taxes and shipping are calculated at checkout.
      </p>
    </footer>
  );
}
