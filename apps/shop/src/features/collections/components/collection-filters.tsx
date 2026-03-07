import { useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import type { ProductFilter } from "@acme/shopify/storefront/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@acme/ui/accordion";
import { Button } from "@acme/ui/button";

import type { CollectionFilter } from "~/features/collections/types";
import {
  CollectionSortByControl,
  CollectionSortDirectionControl,
} from "~/features/collections/components/collection-sort-controls";
import {
  getPriceRangeFromFilters,
  hasSelectedFilterValue,
} from "~/features/collections/lib/collection-filter-utils";
import { useCollectionPageStore } from "~/features/collections/stores/collection-page-store";

type CollectionFiltersMode = "desktop" | "mobile";

export function CollectionFilters() {
  const title = useCollectionPageStore(
    (store) => store.collection?.title ?? "Collection",
  );

  return (
    <aside className="lg:border-border hidden lg:sticky lg:top-26 lg:block lg:h-fit lg:pr-8 xl:top-36">
      <div className="space-y-5">
        <h1 className="font-bold">{title}</h1>

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
  const filters = useCollectionPageStore(
    (store) => store.collection?.products.filters ?? [],
  );
  const visibleFilters = filters.filter((filter) => {
    if (String(filter.type) === "PRICE_RANGE") {
      return true;
    }

    return filter.values.some(
      (value) => typeof value.input === "object" && value.input !== null,
    );
  });

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
  filter: CollectionFilter;
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

function FilterSectionContent({ filter }: { filter: CollectionFilter }) {
  const selectedFilters = useSearch({
    from: "/collections/$handle",
    select: (search) => search.filters,
  });
  const onToggleFilter = useCollectionPageStore(
    (store) => store.onToggleFilter,
  );
  const isFiltering = useCollectionPageStore((store) => store.isFiltering);

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

function PriceRangeFilterContent({
  filterId,
  initialMin,
  initialMax,
}: {
  filterId: string;
  initialMin: string;
  initialMax: string;
}) {
  const [priceMin, setPriceMin] = useState(initialMin);
  const [priceMax, setPriceMax] = useState(initialMax);
  const onApplyPriceRange = useCollectionPageStore(
    (store) => store.onApplyPriceRange,
  );
  const isFiltering = useCollectionPageStore((store) => store.isFiltering);
  const isPriceApplyLoading = useCollectionPageStore(
    (store) => store.isPriceApplyLoading,
  );

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <textarea
          name={`price-min-${filterId}`}
          rows={1}
          value={priceMin}
          placeholder="Min"
          disabled={isFiltering}
          className="bg-input/30 border-input min-h-10 resize-none rounded-lg px-3 py-2 text-base leading-6"
          onChange={(event) => setPriceMin(event.target.value)}
        />
        <textarea
          name={`price-max-${filterId}`}
          rows={1}
          value={priceMax}
          placeholder="Max"
          disabled={isFiltering}
          className="bg-input/30 border-input min-h-10 resize-none rounded-lg px-3 py-2 text-base leading-6"
          onChange={(event) => setPriceMax(event.target.value)}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={isFiltering}
        className="w-full rounded-full"
        onClick={() => {
          onApplyPriceRange(priceMin, priceMax);
        }}
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
