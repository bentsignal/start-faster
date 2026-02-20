import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, User } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@acme/ui/hover-card";

import { secondaryNavLinks } from "~/components/header/nav-data";
import { VerticalMenu } from "~/components/header/vertical-menu";
import { ThemeToggle } from "~/features/theme/atoms/theme-toggle";

export function TopRightControls() {
  return (
    <div className="text-muted-foreground flex w-48 items-center justify-end gap-2 space-x-4">
      <Link
        to="/settings/account"
        className="hover:text-primary transition-colors"
        preload={false}
      >
        <User className="h-6 w-6" strokeWidth={1.5} />
        <span className="sr-only">Account</span>
      </Link>
      <button
        type="button"
        className="hover:text-primary relative flex items-center transition-colors"
      >
        <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
        <div className="bg-primary absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full">
          <span className="text-background text-[10px]">1</span>
        </div>
        <span className="sr-only">Cart</span>
      </button>
      <HoverCard>
        <HoverCardTrigger
          aria-label="Open resources menu"
          delay={0}
          className="hover:text-primary hidden items-center transition-colors min-[1380px]:flex"
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
