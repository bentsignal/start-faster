import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";

import { HorizontalMenu } from "~/components/header/horizontal-menu";
import { TopRightControls } from "~/components/header/top-right-controls";
import { SearchBar } from "~/features/search/molecules/search-bar";
import { SearchStore } from "~/features/search/store";

export function Header() {
  return (
    <SearchStore>
      <header className="bg-background sticky top-0 z-50">
        <div className="sm:border-border flex items-center justify-between px-4 py-4 sm:border-b sm:px-8 xl:px-24">
          <Link to="/" className="w-48">
            <Image
              src="/logo.webp"
              alt="Start Faster Logo"
              width={36}
              height={36}
            />
          </Link>
          <SearchBar className="hidden w-96 sm:flex" />
          <TopRightControls />
        </div>
        <div className="px-4 pb-4 sm:hidden">
          <SearchBar />
        </div>
        <HorizontalMenu />
      </header>
    </SearchStore>
  );
}
