import { Button } from "@acme/ui/button";
import { ScrollArea } from "@acme/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@acme/ui/sheet";

import { CartLineItem } from "~/features/cart/components/cart-line-item";
import { CartSummary } from "~/features/cart/components/cart-summary";
import { useCartStore } from "~/features/cart/store";

export function CartSheet() {
  const isCartOpen = useCartStore((store) => store.isCartOpen);
  const setIsCartOpen = useCartStore((store) => store.setIsCartOpen);
  const cartQuantity = useCartStore((store) => store.cartQuantity);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-md flex-col p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b px-4 py-5 sm:px-6">
          <SheetTitle>Cart</SheetTitle>
          <SheetDescription>
            {cartQuantity} item
            {cartQuantity === 1 ? "" : "s"}
          </SheetDescription>
        </SheetHeader>

        <Body />
      </SheetContent>
    </Sheet>
  );
}

function Body() {
  const lines = useCartStore((store) => store.cartLines);
  const setIsCartOpen = useCartStore((store) => store.setIsCartOpen);
  if (lines.length > 0) {
    return (
      <>
        <div className="border-b px-1 py-3 sm:px-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5"
            onClick={() => setIsCartOpen(false)}
          >
            <span aria-hidden="true">&larr;</span>
            Continue Shopping
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1 px-4 sm:px-6">
          <div className="pb-4">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} />
            ))}
          </div>
        </ScrollArea>
        <CartSummary />
      </>
    );
  }

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
