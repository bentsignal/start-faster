import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";

import { HorizontalMenu } from "~/components/header/horizontal-menu";
import { TopRightControls } from "~/components/header/top-right-controls";
import { SearchClearButton } from "~/features/search/atoms/clear-button";
import { SearchIcon } from "~/features/search/atoms/icon";
import { SearchInput } from "~/features/search/atoms/input";
import { SearchBar } from "~/features/search/atoms/search-bar";
import { SearchStore } from "~/features/search/store";

export function Header() {
  return (
    <SearchStore>
      <header data-site-header className="bg-background sticky top-0 z-50">
        <div className="sm:border-border flex items-center justify-between px-4 py-4 sm:border-b sm:px-8 xl:px-24">
          <Link to="/" className="w-48">
            <Image
              src="/logo.webp"
              alt="Start Faster Logo"
              width={36}
              height={36}
            />
          </Link>
          <SearchBar className="hidden w-96 sm:flex">
            <SearchIcon />
            <SearchInput />
            <SearchClearButton />
          </SearchBar>
          <TopRightControls />
        </div>
        <div className="px-4 pb-4 sm:hidden">
          <SearchBar>
            <SearchIcon />
            <SearchInput />
            <SearchClearButton />
          </SearchBar>
        </div>
        <HorizontalMenu />
      </header>
    </SearchStore>
  );
}
