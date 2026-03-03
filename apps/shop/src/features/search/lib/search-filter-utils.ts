import type { ProductFilter } from "@acme/shopify/storefront/types";

export function hasSelectedFilterValue(
  filters: ProductFilter[],
  input: ProductFilter,
) {
  const target = JSON.stringify(input);
  return filters.some((filter) => JSON.stringify(filter) === target);
}

export function toggleFilter(filters: ProductFilter[], input: ProductFilter) {
  const target = JSON.stringify(input);
  const exists = filters.some((filter) => JSON.stringify(filter) === target);

  if (exists) {
    return filters.filter((filter) => JSON.stringify(filter) !== target);
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

  const minValue = min.trim().length > 0 ? Number(min) : undefined;
  const maxValue = max.trim().length > 0 ? Number(max) : undefined;

  if (minValue !== undefined && Number.isFinite(minValue) === false) {
    return withoutPrice;
  }

  if (maxValue !== undefined && Number.isFinite(maxValue) === false) {
    return withoutPrice;
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
