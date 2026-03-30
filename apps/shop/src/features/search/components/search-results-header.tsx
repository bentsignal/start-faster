import { ArrowDownWideNarrow, ListFilter, Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@acme/ui/drawer";

import { SearchFiltersContent } from "~/features/search/components/search-filters";
import {
  SortByControl,
  SortDirectionControl,
} from "~/features/search/components/search-sort-controls";
import { useSearchResultsHeader } from "~/features/search/hooks/use-search-results-header";

export function SearchResultsHeader() {
  const {
    sortOpen,
    setSortOpen,
    filtersOpen,
    setFiltersOpen,
    query,
    sortBy,
    sortDirection,
    totalCount,
    onSortByChange,
    onSortDirectionChange,
    isFiltering,
    activeFilterCount,
  } = useSearchResultsHeader();

  return (
    <header className="space-y-3 lg:hidden">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm">
          {totalCount} {totalCount === 1 ? "result" : "results"} for{" "}
          <span className="text-foreground font-medium">"{query}"</span>
        </p>

        <div className="flex items-center gap-2 lg:hidden">
          <Drawer open={sortOpen} onOpenChange={setSortOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                {isFiltering ? (
                  <Loader className="size-3.5 animate-spin" />
                ) : (
                  <ArrowDownWideNarrow className="size-3.5" />
                )}
                Sort
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Sort results</DrawerTitle>
                <DrawerDescription>
                  Choose how products are ordered.
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4 px-4 pb-6">
                <SortByControl
                  sortBy={sortBy}
                  onSortByChange={onSortByChange}
                  disabled={isFiltering}
                  className="bg-input/30 border-border h-10 rounded-xl px-3"
                />
                <SortDirectionControl
                  sortDirection={sortDirection}
                  onSortDirectionChange={onSortDirectionChange}
                  disabled={isFiltering}
                  className="bg-input/30 border-border h-10 rounded-xl px-3"
                />
              </div>
            </DrawerContent>
          </Drawer>

          <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 gap-2">
                {isFiltering ? (
                  <Loader className="size-3.5 animate-spin" />
                ) : (
                  <ListFilter className="size-3.5" />
                )}
                Filters
                {activeFilterCount > 0 ? (
                  <span className="bg-primary text-primary-foreground min-w-5 rounded-full px-1.5 text-xs leading-5">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Filter results</DrawerTitle>
                <DrawerDescription>
                  Refine products by availability and price.
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-6">
                <SearchFiltersContent mode="mobile" />
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </header>
  );
}
