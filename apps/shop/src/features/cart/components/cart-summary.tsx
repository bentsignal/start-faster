import { formatPrice } from "~/features/product/lib/price";
import { useCartStore } from "../store";
import { CartCheckoutButton } from "./cart-checkout-button";

export function CartSummary() {
  const amount = useCartStore((store) => store.cart?.cost.totalAmount);
  const totalLabel =
    amount === undefined
      ? formatPrice(0, "USD")
      : formatPrice(amount.amount, amount.currencyCode);

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
