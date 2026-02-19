import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";

import { HorizontalMenu } from "~/components/header/horizontal-menu";
import { SearchBar } from "~/components/header/search-bar";
import { SessionControls } from "~/components/header/session-controls";

export function Header() {
  return (
    <header className="bg-background sticky top-0 z-50">
      <div className="sm:border-border flex items-center justify-between px-4 py-4 sm:border-b sm:px-8 xl:px-24">
        <Link to="/" className="w-48">
          <Image
            src="/public/logo.webp"
            alt="Start Faster"
            width={36}
            height={36}
          />
        </Link>
        <SearchBar className="hidden sm:block" />
        <SessionControls />
      </div>
      <div className="px-4 pb-4 sm:hidden">
        <SearchBar />
      </div>
      <HorizontalMenu />
    </header>
  );
}
