import type { ProductFilter } from "@acme/shopify/storefront/types";
import { Button } from "@acme/ui/button";

import type { SearchResultFilter } from "~/features/search/types";
import {
  getPriceRangeFromFilters,
  hasSelectedFilterValue,
} from "~/features/search/lib/search-filter-utils";
import { useSearchPageStore } from "~/features/search/stores/search-page-store";

export function SearchFilters() {
  const filters = useSearchPageStore((store) => store.data.productFilters);
  const selectedFilters = useSearchPageStore((store) => store.filters);
  const onToggleFilter = useSearchPageStore((store) => store.onToggleFilter);
  const onApplyPriceRange = useSearchPageStore(
    (store) => store.onApplyPriceRange,
  );

  return (
    <aside className="lg:border-border space-y-6 lg:border-r lg:pr-8">
      {filters.map((filter, index) => (
        <FilterSection
          key={filter.id}
          filter={filter}
          selectedFilters={selectedFilters}
          isLast={index === filters.length - 1}
          onToggleFilter={onToggleFilter}
          onApplyPriceRange={onApplyPriceRange}
        />
      ))}
    </aside>
  );
}

function FilterSection({
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
  if (String(filter.type) === "PRICE_RANGE") {
    const priceRange = getPriceRangeFromFilters(selectedFilters);
    return (
      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-wide uppercase">
          {filter.label}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            name={`price-min-${filter.id}`}
            defaultValue={priceRange.min}
            placeholder="Min"
            className="bg-input/30 border-input h-8 rounded-lg px-3 text-sm"
          />
          <input
            name={`price-max-${filter.id}`}
            defaultValue={priceRange.max}
            placeholder="Max"
            className="bg-input/30 border-input h-8 rounded-lg px-3 text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={(event) => {
            const section = event.currentTarget.closest("section");
            if (section === null) {
              return;
            }

            const minValue = section.querySelector<HTMLInputElement>(
              `input[name="price-min-${filter.id}"]`,
            )?.value;
            const maxValue = section.querySelector<HTMLInputElement>(
              `input[name="price-max-${filter.id}"]`,
            )?.value;

            onApplyPriceRange(minValue ?? "", maxValue ?? "");
          }}
        >
          Apply
        </Button>
        {!isLast && <div className="bg-border mt-3 h-px" />}
      </section>
    );
  }

  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold tracking-wide uppercase">
        {filter.label}
      </p>
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
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors ${
                active
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
      {!isLast && <div className="bg-border mt-3 h-px" />}
    </section>
  );
}
