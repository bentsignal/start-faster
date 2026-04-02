import { useSearch } from "@tanstack/react-router";

import type { SearchProductsQuery } from "@acme/shopify/storefront/generated";
import type { ProductFilter } from "@acme/shopify/storefront/types";

import type { FilterGroup } from "~/features/shared/filters/components/filter-section";
import {
  SortByControl,
  SortDirectionControl,
} from "~/features/search/components/search-sort-controls";
import { useSearchFilterActions } from "~/features/search/hooks/use-search-filter-actions";
import { useSearchPriceRangeFilter } from "~/features/search/hooks/use-search-price-range-filter";
import { useSearchTotalCount } from "~/features/search/hooks/use-search-total-count";
import { useSearchVisibleFilters } from "~/features/search/hooks/use-search-visible-filters";
import {
  FilterSectionListDesktop,
  FilterSectionListMobile,
  FilterValueList,
  PriceRangeFilterContent,
} from "~/features/shared/filters/components/filter-section";
import { getPriceRangeFromFilters } from "~/features/shared/filters/filter-utils";

type SearchResultFilter =
  SearchProductsQuery["search"]["productFilters"][number];

type SearchFiltersMode = "desktop" | "mobile";

function toFilterGroup(filter: SearchResultFilter) {
  return {
    id: filter.id,
    label: filter.label,
    type: String(filter.type),
    values: filter.values.map((v) => ({
      id: v.id,
      label: v.label,
      count: v.count,
      input:
        typeof v.input === "object" && v.input !== null
          ? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Shopify JSON scalar has no narrower static type
            (v.input as ProductFilter)
          : undefined,
    })),
  };
}

export function SearchFilters() {
  const query = useSearch({ from: "/search", select: (s) => s.q });
  const sortBy = useSearch({ from: "/search", select: (s) => s.sortBy });
  const sortDirection = useSearch({
    from: "/search",
    select: (s) => s.sortDirection,
  });
  const totalCount = useSearchTotalCount();
  const { onSortByChange, onSortDirectionChange, isFiltering } =
    useSearchFilterActions();

  return (
    <aside className="lg:border-border hidden lg:sticky lg:top-32 lg:block lg:h-fit lg:pr-8 xl:top-42">
      <div className="space-y-5">
        <div className="">
          <p className="text-muted-foreground text-sm">
            {totalCount} {totalCount === 1 ? "result" : "results"} for{" "}
            <span className="text-foreground font-medium">"{query}"</span>
          </p>

          <div className="mt-5 space-y-2.5">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Sort by
            </p>
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
        </div>

        <SearchFiltersContent mode="desktop" />
      </div>
    </aside>
  );
}

export function SearchFiltersContent({ mode }: { mode: SearchFiltersMode }) {
  const visibleFilters = useSearchVisibleFilters();
  const filterGroups = visibleFilters.map(toFilterGroup);

  const renderContent = (filter: FilterGroup) => (
    <SearchFilterSectionContent filter={filter} />
  );

  if (mode === "mobile") {
    return (
      <FilterSectionListMobile
        filters={filterGroups}
        renderContent={renderContent}
      />
    );
  }

  return (
    <FilterSectionListDesktop
      filters={filterGroups}
      renderContent={renderContent}
    />
  );
}

function SearchFilterSectionContent({ filter }: { filter: FilterGroup }) {
  const selectedFilters = useSearch({
    from: "/search",
    select: (s) => s.filters,
  });
  const { onToggleFilter, isFiltering } = useSearchFilterActions();

  if (filter.type === "PRICE_RANGE") {
    const priceRange = getPriceRangeFromFilters(selectedFilters);
    const priceInputKey = `${filter.id}:${priceRange.min}:${priceRange.max}`;

    return (
      <SearchPriceRangeSection
        key={priceInputKey}
        filterId={filter.id}
        initialMin={priceRange.min}
        initialMax={priceRange.max}
      />
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

function SearchPriceRangeSection({
  filterId,
  initialMin,
  initialMax,
}: {
  filterId: string;
  initialMin: string;
  initialMax: string;
}) {
  const {
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    apply,
    isFiltering,
    isPriceApplyLoading,
  } = useSearchPriceRangeFilter({ initialMin, initialMax });

  return (
    <PriceRangeFilterContent
      filterId={filterId}
      priceMin={priceMin}
      priceMax={priceMax}
      setPriceMin={setPriceMin}
      setPriceMax={setPriceMax}
      isFiltering={isFiltering}
      isPriceApplyLoading={isPriceApplyLoading}
      onApply={apply}
    />
  );
}
