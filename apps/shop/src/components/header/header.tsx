import { useSearch } from "@tanstack/react-router";
import { Image } from "@unpic/react";

import { cn } from "@acme/ui/utils";

import { HorizontalMenu } from "~/components/header/horizontal-menu";
import { TopRightControls } from "~/components/header/top-right-controls";
import { Link } from "~/components/link";
import { PredictiveSearchDropdown } from "~/features/search/components/predictive-search-dropdown";
import { SearchClearButton } from "~/features/search/components/search-bar/clear-button";
import { SearchBarContainer } from "~/features/search/components/search-bar/container";
import { SearchIcon } from "~/features/search/components/search-bar/icon";
import { SearchInput } from "~/features/search/components/search-bar/input";
import { SearchBarStore } from "~/features/search/stores/search-bar-store";

export const stickyHeaderTokens = {
  headerHeight: "lg:h-18 xl:h-28",
  spacer: "lg:py-14",
  // header height + spacer
  stickyContent: "lg:sticky lg:top-32 xl:top-42",
};

export function Header() {
  const searchParam = useSearch({
    from: "/search",
    shouldThrow: false,
    select: (search) => search.q,
  });
  return (
    <SearchBarStore initialSearchTerm={searchParam}>
      <header
        data-site-header
        className={cn(
          "bg-background sticky top-0 z-50 flex flex-col justify-center",
          stickyHeaderTokens.headerHeight,
        )}
      >
        <div className="sm:border-border flex items-center justify-between px-4 py-4 sm:border-b sm:px-8 xl:px-24">
          <Link to="/" className="w-48">
            <Image
              src="/logo.webp"
              alt="Start Faster Logo"
              width={36}
              height={36}
            />
          </Link>
          <SearchBarContainer className="hidden w-96 sm:flex">
            <SearchIcon />
            <SearchInput />
            <SearchClearButton />
            <PredictiveSearchDropdown />
          </SearchBarContainer>
          <TopRightControls />
        </div>
        <div className="px-4 pb-4 sm:hidden">
          <SearchBarContainer>
            <SearchIcon />
            <SearchInput />
            <SearchClearButton />
            <PredictiveSearchDropdown />
          </SearchBarContainer>
        </div>
        <HorizontalMenu />
      </header>
    </SearchBarStore>
  );
}
