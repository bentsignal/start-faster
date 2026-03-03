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
import {
  getPriceRangeFromFilters,
  hasSelectedFilterValue,
} from "~/features/search/lib/search-filter-utils";
import { useSearchPageStore } from "~/features/search/stores/search-page-store";

type SearchResultFilter =
  SearchProductsQuery["search"]["productFilters"][number];

type SearchFiltersMode = "desktop" | "mobile";

export function SearchFilters() {
  const query = useSearchPageStore((store) => store.search.q);
  const totalCount = useSearchPageStore((store) => store.totalCount);
  const sortBy = useSearchPageStore((store) => store.search.sortBy);
  const sortDirection = useSearchPageStore(
    (store) => store.search.sortDirection,
  );
  const onSortByChange = useSearchPageStore((store) => store.onSortByChange);
  const onSortDirectionChange = useSearchPageStore(
    (store) => store.onSortDirectionChange,
  );

  return (
    <aside className="lg:border-border hidden lg:sticky lg:top-26 lg:block lg:h-fit lg:pr-8 xl:top-36">
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
              className="bg-input/30 border-border h-10 rounded-xl px-3"
            />
            <SortDirectionControl
              sortDirection={sortDirection}
              onSortDirectionChange={onSortDirectionChange}
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
  const filters = useSearchPageStore(
    (store) => store.data?.productFilters ?? [],
  );
  const visibleFilters = filters.filter((filter) => {
    if (String(filter.type) === "PRICE_RANGE") {
      return true;
    }

    return filter.values.some(
      (value) => typeof value.input === "object" && value.input !== null,
    );
  });
  const selectedFilters = useSearchPageStore((store) => store.filters);
  const onToggleFilter = useSearchPageStore((store) => store.onToggleFilter);
  const onApplyPriceRange = useSearchPageStore(
    (store) => store.onApplyPriceRange,
  );

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
              <FilterSectionContent
                filter={filter}
                selectedFilters={selectedFilters}
                onToggleFilter={onToggleFilter}
                onApplyPriceRange={onApplyPriceRange}
              />
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
          selectedFilters={selectedFilters}
          isLast={index === visibleFilters.length - 1}
          onToggleFilter={onToggleFilter}
          onApplyPriceRange={onApplyPriceRange}
        />
      ))}
    </div>
  );
}

function FilterSectionDesktop({
  filter,
  selectedFilters,
  isLast,
  onToggleFilter,
  onApplyPriceRange,
}: {
  filter: SearchResultFilter;
  selectedFilters: ProductFilter[];
  isLast: boolean;
  onToggleFilter: (input: ProductFilter) => void;
  onApplyPriceRange: (min: string, max: string) => void;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold tracking-wide uppercase">
        {filter.label}
      </p>
      <FilterSectionContent
        filter={filter}
        selectedFilters={selectedFilters}
        onToggleFilter={onToggleFilter}
        onApplyPriceRange={onApplyPriceRange}
      />
      {!isLast && <div className="bg-border mt-3 h-px" />}
    </section>
  );
}

function FilterSectionContent({
  filter,
  selectedFilters,
  onToggleFilter,
  onApplyPriceRange,
}: {
  filter: SearchResultFilter;
  selectedFilters: ProductFilter[];
  onToggleFilter: (input: ProductFilter) => void;
  onApplyPriceRange: (min: string, max: string) => void;
}) {
  if (String(filter.type) === "PRICE_RANGE") {
    const priceRange = getPriceRangeFromFilters(selectedFilters);

    return (
      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <textarea
            name={`price-min-${filter.id}`}
            rows={1}
            defaultValue={priceRange.min}
            placeholder="Min"
            className="bg-input/30 border-input min-h-10 resize-none rounded-lg px-3 py-2 text-base leading-6"
          />
          <textarea
            name={`price-max-${filter.id}`}
            rows={1}
            defaultValue={priceRange.max}
            placeholder="Max"
            className="bg-input/30 border-input min-h-10 resize-none rounded-lg px-3 py-2 text-base leading-6"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-full"
          onClick={(event) => {
            const section = event.currentTarget.closest("section");
            if (section === null) {
              return;
            }

            const minValue = section.querySelector<HTMLTextAreaElement>(
              `textarea[name="price-min-${filter.id}"]`,
            )?.value;
            const maxValue = section.querySelector<HTMLTextAreaElement>(
              `textarea[name="price-max-${filter.id}"]`,
            )?.value;

            onApplyPriceRange(minValue ?? "", maxValue ?? "");
          }}
        >
          Apply
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <div className="space-y-0.5">
        {filter.values.map((value) => {
          if (typeof value.input !== "object" || value.input === null) {
            return null;
          }

          const input = value.input as ProductFilter;
          const active = hasSelectedFilterValue(selectedFilters, input);

          return (
            <button
              key={value.id}
              type="button"
              className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
              onClick={() => {
                onToggleFilter(input);
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
