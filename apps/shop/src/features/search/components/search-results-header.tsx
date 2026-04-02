import { SearchFiltersContent } from "~/features/search/components/search-filters";
import {
  SortByControl,
  SortDirectionControl,
} from "~/features/search/components/search-sort-controls";
import { useSearchResultsHeader } from "~/features/search/hooks/use-search-results-header";
import { ResultsHeader } from "~/features/shared/filters/components/results-header";

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
    <ResultsHeader
      sortOpen={sortOpen}
      setSortOpen={setSortOpen}
      filtersOpen={filtersOpen}
      setFiltersOpen={setFiltersOpen}
      isFiltering={isFiltering}
      activeFilterCount={activeFilterCount}
      sortDrawerTitle="Sort results"
      sortDrawerDescription="Choose how products are ordered."
      filterDrawerTitle="Filter results"
      filterDrawerDescription="Refine products by availability and price."
      summaryContent={
        <p className="text-muted-foreground text-sm">
          {totalCount} {totalCount === 1 ? "result" : "results"} for{" "}
          <span className="text-foreground font-medium">"{query}"</span>
        </p>
      }
      sortControls={
        <>
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
        </>
      }
      filterControls={<SearchFiltersContent mode="mobile" />}
    />
  );
}
