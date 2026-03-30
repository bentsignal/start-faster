import { useSearch } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import type { SearchProductsQuery } from "@acme/shopify/storefront/generated";
import type { ProductFilter } from "@acme/shopify/storefront/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@acme/ui/accordion";
import { Button } from "@acme/ui/button";

import {
  SortByControl,
  SortDirectionControl,
} from "~/features/search/components/search-sort-controls";
import { useSearchFilterActions } from "~/features/search/hooks/use-search-filter-actions";
import { useSearchPriceRangeFilter } from "~/features/search/hooks/use-search-price-range-filter";
import { useSearchProducts } from "~/features/search/hooks/use-search-products";
import { useSearchVisibleFilters } from "~/features/search/hooks/use-search-visible-filters";
import {
  getPriceRangeFromFilters,
  hasSelectedFilterValue,
} from "~/features/search/lib/search-filter-utils";

type SearchResultFilter =
  SearchProductsQuery["search"]["productFilters"][number];

type SearchFiltersMode = "desktop" | "mobile";

export function SearchFilters() {
  const query = useSearch({ from: "/search", select: (s) => s.q });
  const sortBy = useSearch({ from: "/search", select: (s) => s.sortBy });
  const sortDirection = useSearch({
    from: "/search",
    select: (s) => s.sortDirection,
  });
  const { totalCount } = useSearchProducts();
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

  if (mode === "mobile") {
    return (
      <Accordion defaultValue={[]} className="border-border/70 rounded-2xl">
        {visibleFilters.map((filter) => (
          <AccordionItem key={filter.id} value={filter.id}>
            <AccordionTrigger className="py-3.5">
              <span className="text-xs font-semibold tracking-wide uppercase">
                {filter.label}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <FilterSectionContent filter={filter} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  return (
    <div className="space-y-6">
      {visibleFilters.map((filter, index) => (
        <FilterSectionDesktop
          key={filter.id}
          filter={filter}
          isLast={index === visibleFilters.length - 1}
        />
      ))}
    </div>
  );
}

function FilterSectionDesktop({
  filter,
  isLast,
}: {
  filter: SearchResultFilter;
  isLast: boolean;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold tracking-wide uppercase">
        {filter.label}
      </p>
      <FilterSectionContent filter={filter} />
      {!isLast && <div className="bg-border mt-3 h-px" />}
    </section>
  );
}

function FilterSectionContent({ filter }: { filter: SearchResultFilter }) {
  const selectedFilters = useSearch({
    from: "/search",
    select: (s) => s.filters,
  });
  const { onToggleFilter, isFiltering } = useSearchFilterActions();

  if (String(filter.type) === "PRICE_RANGE") {
    const priceRange = getPriceRangeFromFilters(selectedFilters);
    const priceInputKey = `${filter.id}:${priceRange.min}:${priceRange.max}`;

    return (
      <PriceRangeFilterContent
        key={priceInputKey}
        filterId={filter.id}
        initialMin={priceRange.min}
        initialMax={priceRange.max}
      />
    );
  }

  return (
    <section className="space-y-2">
      <div className="space-y-0.5">
        {filter.values.map((value) => {
          if (typeof value.input !== "object" || value.input === null) {
            return null;
          }

          // Shopify returns FilterValue.input as `unknown` (JSON scalar).
          // After the object guard above we know it's a non-null object, but
          // there is no runtime schema to validate the full ProductFilter shape.
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Shopify JSON scalar has no narrower static type
          const input = value.input as ProductFilter;
          const active = hasSelectedFilterValue(selectedFilters, input);

          return (
            <button
              key={value.id}
              type="button"
              disabled={isFiltering}
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => {
                void onToggleFilter(input);
              }}
            >
              <span>{value.label}</span>
              <span className="text-xs tabular-nums">{value.count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PriceRangeFilterContent({
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
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <textarea
          name={`price-min-${filterId}`}
          rows={1}
          value={priceMin}
          placeholder="Min"
          disabled={isFiltering}
          className="bg-input/30 border-input min-h-10 resize-none rounded-lg px-3 py-2 text-sm leading-6"
          onChange={(event) => setPriceMin(event.target.value)}
        />
        <textarea
          name={`price-max-${filterId}`}
          rows={1}
          value={priceMax}
          placeholder="Max"
          disabled={isFiltering}
          className="bg-input/30 border-input min-h-10 resize-none rounded-lg px-3 py-2 text-sm leading-6"
          onChange={(event) => setPriceMax(event.target.value)}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={isFiltering}
        className="w-full rounded-full"
        onClick={apply}
      >
        {isPriceApplyLoading ? (
          <Loader className="size-3.5 animate-spin" />
        ) : (
          "Apply"
        )}
      </Button>
    </section>
  );
}
