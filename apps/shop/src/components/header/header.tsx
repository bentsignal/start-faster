import { useSearch } from "@tanstack/react-router";

import { QuickLink } from "@acme/features/quick-link";
import { ScreenSize, useScreenStore } from "@acme/features/screen";
import { cn } from "@acme/ui/utils";

import { HorizontalMenu } from "~/components/header/horizontal-menu";
import { TopRightControls } from "~/components/header/top-right-controls";
import { Image } from "~/components/image";
import { PredictiveSearchDropdown } from "~/features/search/components/predictive-search-dropdown";
import { SearchClearButton } from "~/features/search/components/search-bar/clear-button";
import { SearchBarContainer } from "~/features/search/components/search-bar/container";
import { SearchIcon } from "~/features/search/components/search-bar/icon";
import { SearchInput } from "~/features/search/components/search-bar/input";
import { SearchBarStore } from "~/features/search/stores/search-bar-store";
import { useIsHydrated } from "~/hooks/use-is-hydrated";

export const stickyHeaderTokens = {
  headerHeight: "lg:h-18 xl:h-28",
  spacer: "lg:py-14",
  // header height + spacer
  stickyContent: "lg:sticky lg:top-32 xl:top-42",
};

export function Header() {
  const isHydrated = useIsHydrated();
  const screen = useScreenStore((store) => store.screen);
  const searchParam = useSearch({
    from: "/search",
    shouldThrow: false,
    select: (search) => search.q,
  });
  const shouldRenderSingleSearchBar = isHydrated && screen.size !== undefined;
  const showDesktopSearch = shouldRenderSingleSearchBar
    ? screen.isBiggerThan(ScreenSize.SM)
    : true;
  const showMobileSearch = shouldRenderSingleSearchBar
    ? !screen.isBiggerThan(ScreenSize.SM)
    : true;

  return (
    <header
      data-site-header
      className={cn(
        "bg-background sticky top-0 z-50 flex flex-col justify-center",
        stickyHeaderTokens.headerHeight,
      )}
    >
      <div className="sm:border-border flex items-center justify-between px-4 py-4 sm:border-b sm:px-8 xl:px-24">
        <QuickLink to="/" className="w-48">
          <Image
            src="/logo.webp"
            alt="Start Faster Logo"
            width={40}
            height={40}
            loading="eager"
          />
        </QuickLink>
        {showDesktopSearch ? (
          <SearchBarStore initialSearchTerm={searchParam}>
            <SearchBarContainer className="hidden w-96 sm:flex">
              <SearchIcon />
              <SearchInput />
              <SearchClearButton />
              <PredictiveSearchDropdown />
            </SearchBarContainer>
          </SearchBarStore>
        ) : null}
        <TopRightControls />
      </div>
      {showMobileSearch ? (
        <div className="px-4 pb-4 sm:hidden">
          <SearchBarStore initialSearchTerm={searchParam}>
            <SearchBarContainer>
              <SearchIcon />
              <SearchInput />
              <SearchClearButton />
              <PredictiveSearchDropdown />
            </SearchBarContainer>
          </SearchBarStore>
        </div>
      ) : null}
      <HorizontalMenu />
    </header>
  );
}
