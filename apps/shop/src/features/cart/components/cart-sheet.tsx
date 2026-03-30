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
import { useCart } from "~/features/cart/hooks/use-cart";
import { useCartStore } from "~/features/cart/store";
import { CartEmpty } from "./cart-empty";

export function CartSheet() {
  const isCartOpen = useCartStore((store) => store.isCartOpen);
  const setIsCartOpen = useCartStore((store) => store.setIsCartOpen);
  const { cartQuantity } = useCart();

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
  const { cart } = useCart();
  const lines = cart?.lines.nodes ?? [];

  if (lines.length > 0) {
    return (
      <>
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

  return <CartEmpty />;
}
