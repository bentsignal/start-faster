import { Link, useRouteContext } from "@tanstack/react-router";
import { Menu, ShoppingCart, User } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@acme/ui/hover-card";

import { secondaryNavLinks } from "~/components/header/nav-data";
import { VerticalMenu } from "~/components/header/vertical-menu";
import { useCartQuantity } from "~/features/cart/hooks/use-cart";
import { useCartStore } from "~/features/cart/store";
import { ThemeToggle } from "~/features/theme/atoms/theme-toggle";

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
  const totalQuantity = useCartQuantity();
  const openCart = useCartStore((store) => store.openCart);

  return (
    <div className="text-muted-foreground flex w-48 items-center justify-end gap-2 space-x-4">
      {isSignedIn ? (
        <Link
          to="/settings/account"
          className="hover:text-primary transition-colors"
          preload={false}
        >
          <AccountIcon />
        </Link>
      ) : (
        <Link
          to="."
          search={(previousSearch) => ({
            ...previousSearch,
            showLogin: true,
            returnTo: "/settings/account",
          })}
          className="hover:text-primary transition-colors"
          preload={false}
          resetScroll={false}
        >
          <AccountIcon />
        </Link>
      )}
      <button
        type="button"
        className="hover:text-primary relative flex items-center transition-colors hover:cursor-pointer"
        onClick={openCart}
      >
        <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
        {totalQuantity > 0 ? (
          <div className="bg-primary absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1">
            <span className="text-primary-foreground text-[10px] leading-none tabular-nums">
              {totalQuantity > 99 ? "99+" : totalQuantity}
            </span>
          </div>
        ) : null}
        <span className="sr-only">Cart</span>
      </button>
      <HoverCard>
        <HoverCardTrigger
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
          <ThemeToggle />
        </HoverCardContent>
      </HoverCard>
      <VerticalMenu />
    </div>
  );
}
