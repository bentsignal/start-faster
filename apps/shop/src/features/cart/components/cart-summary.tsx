import { useCartStore } from "~/features/cart/store";
import { CartCheckoutButton } from "./cart-checkout-button";

export function CartSummary() {
  const totalLabel = useCartStore((store) => store.totalLabel);

  return (
    <footer className="border-t p-4 sm:p-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total</span>
        <span className="font-medium tabular-nums">{totalLabel}</span>
      </div>
      <CartCheckoutButton />
      <p className="text-muted-foreground text-xs">
        Taxes and shipping are calculated at checkout.
      </p>
    </footer>
  );
}
