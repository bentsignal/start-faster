import type { ProductFilter } from "@acme/shopify/storefront/types";

import { supportedCollectionFilterSchema } from "~/features/collections/schema";
import { sanitizeFilters } from "~/features/shared/filters/filter-utils";

export function parseCollectionFilter(value: unknown) {
  const parsedResult = supportedCollectionFilterSchema.safeParse(value);
  if (parsedResult.success === false) {
    return undefined;
  }

  return parsedResult.data;
}

export function isSupportedProductFilter(
  value: unknown,
): value is ProductFilter {
  return parseCollectionFilter(value) !== undefined;
}

export function sanitizeCollectionFilters(value: unknown) {
  return sanitizeFilters(value, isSupportedProductFilter);
}
