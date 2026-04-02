import { CollectionFiltersContent } from "~/features/collections/components/collection-filters";
import {
  CollectionSortByControl,
  CollectionSortDirectionControl,
} from "~/features/collections/components/collection-sort-controls";
import { useCollectionResultsHeader } from "~/features/collections/hooks/use-collection-results-header";
import { ResultsHeader } from "~/features/shared/filters/components/results-header";

export function CollectionResultsHeader() {
  const {
    sortOpen,
    setSortOpen,
    filtersOpen,
    setFiltersOpen,
    isFiltering,
    activeFilterCount,
  } = useCollectionResultsHeader();

  return (
    <ResultsHeader
      sortOpen={sortOpen}
      setSortOpen={setSortOpen}
      filtersOpen={filtersOpen}
      setFiltersOpen={setFiltersOpen}
      isFiltering={isFiltering}
      activeFilterCount={activeFilterCount}
      sortDrawerTitle="Sort products"
      sortDrawerDescription="Choose how products are ordered."
      filterDrawerTitle="Filter products"
      filterDrawerDescription="Refine products by availability and price."
      sortControls={
        <>
          <CollectionSortByControl className="bg-input/30 border-border h-10 rounded-xl px-3" />
          <CollectionSortDirectionControl className="bg-input/30 border-border h-10 rounded-xl px-3" />
        </>
      }
      filterControls={<CollectionFiltersContent mode="mobile" />}
    />
  );
}
