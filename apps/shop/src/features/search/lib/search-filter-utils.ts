import type { ProductFilter } from "@acme/shopify/storefront/types";

import { supportedFilterSchema } from "~/features/search/schema";

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).sort(([left], [right]) =>
      left.localeCompare(right),
    );
    return `{${entries
      .map(([key, entryValue]) => `${key}:${stableSerialize(entryValue)}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function buildFilterKey(filter: ProductFilter) {
  return stableSerialize(filter);
}

export function hasSelectedFilterValue(
  filters: ProductFilter[],
  input: ProductFilter,
) {
  const target = buildFilterKey(input);
  const filterKeys = new Set(filters.map((filter) => buildFilterKey(filter)));
  return filterKeys.has(target);
}

export function toggleFilter(filters: ProductFilter[], input: ProductFilter) {
  const target = buildFilterKey(input);
  const filterKeys = filters.map((filter) => buildFilterKey(filter));
  const exists = filterKeys.includes(target);

  if (exists) {
    return filters.filter((filter, index) => filterKeys[index] !== target);
  }

  return [...filters, input];
}

export function getPriceRangeFromFilters(filters: ProductFilter[]) {
  const priceFilter = filters.find(
    (
      filter,
    ): filter is ProductFilter & {
      price: NonNullable<ProductFilter["price"]>;
    } => "price" in filter && filter.price !== undefined,
  );

  return {
    min:
      priceFilter?.price.min === undefined ? "" : String(priceFilter.price.min),
    max:
      priceFilter?.price.max === undefined ? "" : String(priceFilter.price.max),
  };
}

export function applyPriceRangeFilter({
  filters,
  min,
  max,
}: {
  filters: ProductFilter[];
  min: string;
  max: string;
}) {
  const withoutPrice = filters.filter((filter) => {
    return !("price" in filter && filter.price);
  });

  let minValue = min.trim().length > 0 ? Number(min) : undefined;
  let maxValue = max.trim().length > 0 ? Number(max) : undefined;

  if (minValue !== undefined && Number.isFinite(minValue) === false) {
    minValue = undefined;
  }

  if (maxValue !== undefined && Number.isFinite(maxValue) === false) {
    maxValue = undefined;
  }

  if (minValue === undefined && maxValue === undefined) {
    return withoutPrice;
  }

  return [
    ...withoutPrice,
    {
      price: {
        min: minValue,
        max: maxValue,
      },
    },
  ];
}

export function isSupportedProductFilter(
  value: unknown,
): value is ProductFilter {
  return supportedFilterSchema.safeParse(value).success;
}

export function sanitizeProductFilters(value: unknown) {
  if (Array.isArray(value) === false) {
    return [];
  }

  const validFilters = [];

  for (const rawFilter of value) {
    if (isSupportedProductFilter(rawFilter)) {
      validFilters.push(rawFilter);
    }
  }

  return validFilters;
}
