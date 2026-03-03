import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "@tanstack/react-router";
import { z } from "zod";

import type { ProductFilter } from "@acme/shopify/storefront/types";

import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";

const sortBySchema = z.enum(["relevance", "price"]).default("relevance");
const sortDirectionSchema = z.enum(["asc", "desc"]).default("desc");

export const searchRouteSchema = z.object({
  q: z.string().default(""),
  sortBy: sortBySchema,
  sortDirection: sortDirectionSchema,
  filters: z.array(z.record(z.string(), z.unknown())).default([]),
  page: z.coerce.number().int().min(1).default(1),
  cursor: z.string().optional(),
});

export type SearchRouteSearch = z.infer<typeof searchRouteSchema>;

function isProductFilter(value: unknown): value is ProductFilter {
  return typeof value === "object" && value !== null;
}

export function toProductFilters(filters: SearchRouteSearch["filters"]) {
  return filters.filter(isProductFilter);
}

export async function loadSearchPageData({
  queryClient,
  search,
}: {
  queryClient: QueryClient;
  search: SearchRouteSearch;
}) {
  const query = search.q.trim();
  if (query.length === 0) {
    throw redirect({ to: "/" });
  }

  const filters = toProductFilters(search.filters);

  let cursor = search.cursor;

  if (search.page === 1) {
    cursor = undefined;
  }

  if (search.page > 1 && cursor === undefined) {
    cursor = await searchQueries.resolveCursorForPage({
      page: search.page,
      query,
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      filters,
    });
  }

  if (search.page > 1 && cursor === undefined) {
    throw redirect({
      to: "/search",
      search: {
        q: query,
        sortBy: search.sortBy,
        sortDirection: search.sortDirection,
        filters,
        page: 1,
      },
    });
  }

  const normalizedSearch = {
    q: query,
    sortBy: search.sortBy,
    sortDirection: search.sortDirection,
    filters,
    page: search.page,
    cursor,
  };

  if (
    normalizedSearch.q !== search.q ||
    normalizedSearch.cursor !== search.cursor ||
    normalizedSearch.filters.length !== search.filters.length
  ) {
    throw redirect({
      to: "/search",
      search: normalizedSearch,
    });
  }

  await queryClient.ensureQueryData(
    searchQueries.products({
      query,
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      filters,
      first: SEARCH_PAGE_SIZE,
      after: cursor,
    }),
  );
}
