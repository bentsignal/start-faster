import { Button } from "@acme/ui/button";

import { useCartStore } from "~/features/cart/store";

export function CartEmpty() {
  const setIsCartOpen = useCartStore((store) => store.setIsCartOpen);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-base font-medium">Your cart is empty.</p>
      <p className="text-muted-foreground mt-2 text-sm">
        Items will appear here after hitting "Add to Cart"
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={() => setIsCartOpen(false)}
      >
        Continue Shopping
      </Button>
    </div>
  );
}
