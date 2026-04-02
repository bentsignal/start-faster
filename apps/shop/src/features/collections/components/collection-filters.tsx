import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "@tanstack/react-router";

import type { FilterGroup } from "~/features/shared/filters/components/filter-section";
import {
  CollectionSortByControl,
  CollectionSortDirectionControl,
} from "~/features/collections/components/collection-sort-controls";
import { useCollectionFilterActions } from "~/features/collections/hooks/use-collection-filter-actions";
import { useCollectionPriceRangeFilter } from "~/features/collections/hooks/use-collection-price-range-filter";
import { parseCollectionFilter } from "~/features/collections/lib/collection-filter-utils";
import {
  COLLECTION_PAGE_SIZE,
  collectionQueries,
} from "~/features/collections/lib/collection-queries";
import {
  FilterSectionListDesktop,
  FilterSectionListMobile,
  FilterValueList,
  PriceRangeFilterContent,
} from "~/features/shared/filters/components/filter-section";
import { getPriceRangeFromFilters } from "~/features/shared/filters/filter-utils";

function useCollectionFilters() {
  const handle = useParams({
    from: "/collections/$handle",
    select: (params) => params.handle,
  });
  const searchState = useSearch({
    from: "/collections/$handle",
    select: (search) => ({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      urlFilters: search.filters,
    }),
  });

  const { data } = useSuspenseInfiniteQuery({
    ...collectionQueries.productsInfinite({
      handle,
      sortBy: searchState.sortBy,
      sortDirection: searchState.sortDirection,
      filters: searchState.urlFilters,
      first: COLLECTION_PAGE_SIZE,
    }),
    refetchOnMount: false,
    select: (queryData) => queryData.pages[0]?.products.filters ?? [],
  });

  const filters = data
    .filter((filter) => {
      if (String(filter.type) === "PRICE_RANGE") {
        return true;
      }

      return filter.values.some(
        (value) => parseCollectionFilter(value.input) !== undefined,
      );
    })
    .map(toFilterGroup);

  return filters;
}

function useCollectionTitle() {
  const handle = useParams({
    from: "/collections/$handle",
    select: (params) => params.handle,
  });
  const searchState = useSearch({
    from: "/collections/$handle",
    select: (search) => ({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      urlFilters: search.filters,
    }),
  });

  const { data } = useSuspenseInfiniteQuery({
    ...collectionQueries.productsInfinite({
      handle,
      sortBy: searchState.sortBy,
      sortDirection: searchState.sortDirection,
      filters: searchState.urlFilters,
      first: COLLECTION_PAGE_SIZE,
    }),
    refetchOnMount: false,
    select: (queryData) => queryData.pages[0]?.title,
  });

  return data;
}

type CollectionFiltersMode = "desktop" | "mobile";

function toFilterGroup(filter: {
  id: string;
  label: string;
  type: string;
  values: { id: string; label: string; count: number; input: unknown }[];
}) {
  return {
    id: filter.id,
    label: filter.label,
    type: String(filter.type),
    values: filter.values.map((v) => ({
      id: v.id,
      label: v.label,
      count: v.count,
      input: parseCollectionFilter(v.input),
    })),
  };
}

export function CollectionFilters() {
  const title = useCollectionTitle();

  return (
    <aside className="lg:border-border hidden lg:sticky lg:top-32 lg:block lg:h-fit lg:pr-8 xl:top-42">
      <div className="space-y-5">
        {title ? <h1 className="text-sm font-bold">{title}</h1> : null}

        <div>
          <div className="space-y-2.5">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Sort by
            </p>
            <CollectionSortByControl className="bg-input/30 border-border h-10 rounded-xl px-3" />
            <CollectionSortDirectionControl className="bg-input/30 border-border h-10 rounded-xl px-3" />
          </div>
        </div>

        <CollectionFiltersContent mode="desktop" />
      </div>
    </aside>
  );
}

export function CollectionFiltersContent({
  mode,
}: {
  mode: CollectionFiltersMode;
}) {
  const filters = useCollectionFilters();

  const renderContent = (filter: FilterGroup) => (
    <CollectionFilterSectionContent filter={filter} />
  );

  if (mode === "mobile") {
    return (
      <FilterSectionListMobile
        filters={filters}
        renderContent={renderContent}
      />
    );
  }

  return (
    <FilterSectionListDesktop filters={filters} renderContent={renderContent} />
  );
}

function CollectionFilterSectionContent({ filter }: { filter: FilterGroup }) {
  const selectedFilters = useSearch({
    from: "/collections/$handle",
    select: (search) => search.filters,
  });
  const { onToggleFilter, isFiltering } = useCollectionFilterActions();

  if (filter.type === "PRICE_RANGE") {
    const priceRange = getPriceRangeFromFilters(selectedFilters);
    const priceInputKey = `${filter.id}:${priceRange.min}:${priceRange.max}`;

    return (
      <CollectionPriceRangeSection key={priceInputKey} filterId={filter.id} />
    );
  }

  return (
    <FilterValueList
      values={filter.values}
      selectedFilters={selectedFilters}
      isFiltering={isFiltering}
      onToggleFilter={onToggleFilter}
    />
  );
}

function CollectionPriceRangeSection({ filterId }: { filterId: string }) {
  const {
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    isFiltering,
    isPriceApplyLoading,
    onApply,
  } = useCollectionPriceRangeFilter();

  return (
    <PriceRangeFilterContent
      filterId={filterId}
      priceMin={priceMin}
      priceMax={priceMax}
      setPriceMin={setPriceMin}
      setPriceMax={setPriceMax}
      isFiltering={isFiltering}
      isPriceApplyLoading={isPriceApplyLoading}
      onApply={onApply}
    />
  );
}
