import type { QueryClient } from "@tanstack/react-query";

import type {
  ProductFilter,
  SearchSortKeys,
} from "@acme/shopify/storefront/types";
import {
  getPredictiveSearch,
  searchProducts,
} from "@acme/shopify/storefront/search";

import { shopify } from "~/lib/shopify";

export const PREDICTIVE_SEARCH_PAGE_SIZE = 6;
export const SEARCH_PAGE_SIZE = 30;
export const MAX_SEARCH_PAGE = 50;
export const MAX_PAGE_ITERATIONS = MAX_SEARCH_PAGE - 1;

export type SearchSortBy = "relevance" | "price";
export type SearchSortDirection = "asc" | "desc";

function getSearchSortKey(sortBy: SearchSortBy): SearchSortKeys {
  if (sortBy === "price") {
    return "PRICE" as SearchSortKeys;
  }

  return "RELEVANCE" as SearchSortKeys;
}

export const searchQueries = {
  predictive: ({ query }: { query: string }) => ({
    queryKey: ["search", "predictive", query] as const,
    queryFn: async () => {
      const response = await shopify.request(getPredictiveSearch, {
        variables: {
          query,
          limit: PREDICTIVE_SEARCH_PAGE_SIZE,
        },
      });

      return response.data?.predictiveSearch;
    },
  }),
  products: ({
    query,
    sortBy,
    sortDirection,
    filters,
    first,
    after,
    before,
  }: {
    query: string;
    sortBy: SearchSortBy;
    sortDirection: SearchSortDirection;
    filters: ProductFilter[];
    first: number;
    after?: string;
    before?: string;
  }) => ({
    queryKey: [
      "search",
      "products",
      query,
      sortBy,
      sortDirection,
      filters,
      first,
      after,
      before,
    ] as const,
    queryFn: async () => {
      const response = await shopify.request(searchProducts, {
        variables: {
          query,
          sortKey: getSearchSortKey(sortBy),
          reverse: sortBy === "price" ? sortDirection === "desc" : false,
          productFilters: filters,
          first,
          after,
          before,
        },
      });

      return response.data?.search;
    },
  }),
  resolveCursorForPage: async ({
    queryClient,
    page,
    query,
    sortBy,
    sortDirection,
    filters,
  }: {
    queryClient?: QueryClient;
    page: number;
    query: string;
    sortBy: SearchSortBy;
    sortDirection: SearchSortDirection;
    filters: ProductFilter[];
  }) => {
    if (page <= 1) {
      return undefined;
    }

    if (page > MAX_SEARCH_PAGE) {
      return undefined;
    }

    let currentPage = 1;
    let cursor: string | undefined;
    let iterationCount = 0;

    while (currentPage < page) {
      if (iterationCount >= MAX_PAGE_ITERATIONS) {
        return undefined;
      }

      const searchProductsQuery = searchQueries.products({
        query,
        sortBy,
        sortDirection,
        filters,
        first: SEARCH_PAGE_SIZE,
        after: cursor,
      });

      const result = queryClient
        ? await queryClient.ensureQueryData(searchProductsQuery)
        : await searchProductsQuery.queryFn();

      const nextCursor = result?.pageInfo.endCursor ?? undefined;
      if (nextCursor === undefined) {
        return undefined;
      }

      cursor = nextCursor;
      currentPage += 1;
      iterationCount += 1;
    }

    return cursor;
  },
};
