import { Link, useRouteContext } from "@tanstack/react-router";
import { Menu, ShoppingCart, User } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";
import { ThemeToggle } from "@acme/features/theme";
import { Button } from "@acme/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@acme/ui/hover-card";

import { secondaryNavLinks } from "~/components/header/nav-data";
import { VerticalMenu } from "~/components/header/vertical-menu";
import { useCart } from "~/features/cart/hooks/use-cart";
import { useCartStore } from "~/features/cart/store";

function AccountIcon() {
  return (
    <>
      <User className="h-6 w-6" strokeWidth={1.5} />
      <span className="sr-only">Account</span>
    </>
  );
}

export function TopRightControls() {
  const isSignedIn = useRouteContext({
    from: "__root__",
    select: (context) => context.auth.isSignedIn,
  });
  const { cartQuantity } = useCart();
  const setIsCartOpen = useCartStore((store) => store.setIsCartOpen);

  return (
    <div className="text-muted-foreground flex w-48 items-center justify-end gap-2 space-x-4">
      {isSignedIn ? (
        <QuickLink
          to="/orders"
          className="hover:text-primary transition-colors"
        >
          <AccountIcon />
        </QuickLink>
      ) : (
        <Link
          to="."
          search={(previousSearch) => ({
            ...previousSearch,
            showLogin: true,
            returnTo: "/orders",
          })}
          className="hover:text-primary transition-colors"
          resetScroll={false}
        >
          <AccountIcon />
        </Link>
      )}
      <button
        type="button"
        className="hover:text-primary relative flex items-center transition-colors hover:cursor-pointer"
        onClick={() => setIsCartOpen(true)}
      >
        <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
        {cartQuantity > 0 ? (
          <div className="bg-primary absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1">
            <span className="text-primary-foreground text-[10px] leading-none tabular-nums">
              {cartQuantity > 99 ? "99+" : cartQuantity}
            </span>
          </div>
        ) : null}
        <span className="sr-only">Cart</span>
      </button>
      <HoverCard>
        <HoverCardTrigger
          render={<button type="button" />}
          aria-label="Open resources menu"
          delay={0}
          className="hover:text-primary hidden items-center transition-colors xl:flex"
        >
          <Menu className="h-6 w-6" strokeWidth={1.5} />
        </HoverCardTrigger>
        <HoverCardContent align="end" className="w-52 rounded-md p-2">
          {secondaryNavLinks.map((secondaryLink) => (
            <Button
              key={secondaryLink}
              variant="ghost"
              className="w-full justify-start"
            >
              {secondaryLink}
            </Button>
          ))}
          <ThemeToggle className="w-full" />
        </HoverCardContent>
      </HoverCard>
      <VerticalMenu />
    </div>
  );
}
