import type { ReactNode } from "react";
import { Loader } from "lucide-react";

import type { ProductFilter } from "@acme/shopify/storefront/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@acme/ui/accordion";
import { Button } from "@acme/ui/button";

import { hasSelectedFilterValue } from "~/features/shared/filters/filter-utils";

export interface FilterValue {
  id: string;
  label: string;
  count: number;
  input: ProductFilter | undefined;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: string;
  values: FilterValue[];
}

export function FilterSectionDesktop({
  filter,
  isLast,
  children,
}: {
  filter: FilterGroup;
  isLast: boolean;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold tracking-wide uppercase">
        {filter.label}
      </p>
      {children}
      {!isLast && <div className="bg-border mt-3 h-px" />}
    </section>
  );
}

export function FilterSectionListDesktop({
  filters,
  renderContent,
}: {
  filters: FilterGroup[];
  renderContent: (filter: FilterGroup) => ReactNode;
}) {
  return (
    <div className="space-y-6">
      {filters.map((filter, index) => (
        <FilterSectionDesktop
          key={filter.id}
          filter={filter}
          isLast={index === filters.length - 1}
        >
          {renderContent(filter)}
        </FilterSectionDesktop>
      ))}
    </div>
  );
}

export function FilterSectionListMobile({
  filters,
  renderContent,
}: {
  filters: FilterGroup[];
  renderContent: (filter: FilterGroup) => ReactNode;
}) {
  return (
    <Accordion defaultValue={[]} className="border-border/70 rounded-2xl">
      {filters.map((filter) => (
        <AccordionItem key={filter.id} value={filter.id}>
          <AccordionTrigger className="py-3.5">
            <span className="text-xs font-semibold tracking-wide uppercase">
              {filter.label}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            {renderContent(filter)}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function FilterValueList({
  values,
  selectedFilters,
  isFiltering,
  onToggleFilter,
}: {
  values: FilterValue[];
  selectedFilters: ProductFilter[];
  isFiltering: boolean;
  onToggleFilter: (input: ProductFilter) => void;
}) {
  return (
    <section className="space-y-2">
      <div className="space-y-0.5">
        {values.map((value) => {
          if (value.input === undefined) {
            return null;
          }

          const active = hasSelectedFilterValue(selectedFilters, value.input);
          const input = value.input;

          return (
            <button
              key={value.id}
              type="button"
              aria-pressed={active}
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

export function PriceRangeFilterContent({
  filterId,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  isFiltering,
  isPriceApplyLoading,
  onApply,
}: {
  filterId: string;
  priceMin: string;
  priceMax: string;
  setPriceMin: (value: string) => void;
  setPriceMax: (value: string) => void;
  isFiltering: boolean;
  isPriceApplyLoading: boolean;
  onApply: () => void;
}) {
  return (
    <section className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          inputMode="decimal"
          name={`price-min-${filterId}`}
          aria-label={`Minimum price for ${filterId}`}
          value={priceMin}
          placeholder="Min"
          disabled={isFiltering}
          className="bg-input/30 border-input h-10 rounded-lg px-3 py-2 text-sm leading-6"
          onChange={(event) => setPriceMin(event.target.value)}
        />
        <input
          type="text"
          inputMode="decimal"
          name={`price-max-${filterId}`}
          aria-label={`Maximum price for ${filterId}`}
          value={priceMax}
          placeholder="Max"
          disabled={isFiltering}
          className="bg-input/30 border-input h-10 rounded-lg px-3 py-2 text-sm leading-6"
          onChange={(event) => setPriceMax(event.target.value)}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={isFiltering}
        className="w-full rounded-full"
        onClick={onApply}
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
