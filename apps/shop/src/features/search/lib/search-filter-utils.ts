import type { ProductFilter } from "@acme/shopify/storefront/types";

import { supportedFilterSchema } from "~/features/search/schema";
import { sanitizeFilters } from "~/features/shared/filters/filter-utils";

export function isSupportedProductFilter(
  value: unknown,
): value is ProductFilter {
  return supportedFilterSchema.safeParse(value).success;
}

export function sanitizeProductFilters(value: unknown) {
  return sanitizeFilters(value, isSupportedProductFilter);
}
