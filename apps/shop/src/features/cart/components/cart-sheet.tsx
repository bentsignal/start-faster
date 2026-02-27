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
import {
  useCartQuery,
  useRemoveCartLine,
  useUpdateCartLine,
} from "~/features/cart/hooks/use-cart";
import { useCartStore } from "~/features/cart/store";

export function CartSheet() {
  const isCartOpen = useCartStore((store) => store.isCartOpen);
  const setCartOpen = useCartStore((store) => store.setCartOpen);
  const closeCart = useCartStore((store) => store.closeCart);
  const cartQuery = useCartQuery();
  const updateCartLine = useUpdateCartLine();
  const removeCartLine = useRemoveCartLine();
  const cart = cartQuery.data ?? null;
  const hasItems = (cart?.lines.length ?? 0) > 0;

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-md flex-col p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b px-4 py-5 sm:px-6">
          <SheetTitle>Cart</SheetTitle>
          <SheetDescription>
            {cart?.totalQuantity ?? 0} item
            {cart?.totalQuantity === 1 ? "" : "s"}
          </SheetDescription>
        </SheetHeader>

        {cartQuery.isLoading && cart === null ? (
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            Loading cart...
          </div>
        ) : hasItems && cart !== null ? (
          <>
            <ScrollArea className="min-h-0 flex-1 px-4 sm:px-6">
              <div className="pb-4">
                {cart.lines.map((line) => (
                  <CartLineItem
                    key={line.id}
                    line={line}
                    changeLineQuantity={updateCartLine.changeLineQuantity}
                    clearLineIntent={updateCartLine.clearLineIntent}
                    removeLine={(lineId) => {
                      removeCartLine.mutate({ lineId });
                    }}
                  />
                ))}
              </div>
            </ScrollArea>
            <CartSummary
              cart={cart}
              flushPendingCartUpdates={updateCartLine.flushPending}
            />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-base font-medium">Your cart is empty.</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Add an item from any product page to get started.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={closeCart}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
