import { infiniteQueryOptions } from "@tanstack/react-query";

import type { ProductFilter } from "@acme/shopify/storefront/types";
import {
  getPredictiveSearch,
  searchProducts,
} from "@acme/shopify/storefront/search";
import { SearchSortKeys } from "@acme/shopify/storefront/types";

import { shopify } from "~/lib/shopify";

export const PREDICTIVE_SEARCH_PAGE_SIZE = 6;
export const SEARCH_PAGE_SIZE = 30;

export type SearchSortBy = "relevance" | "price";
export type SearchSortDirection = "asc" | "desc";

function getSearchSortKey(sortBy: SearchSortBy) {
  if (sortBy === "price") {
    return SearchSortKeys.Price;
  }

  return SearchSortKeys.Relevance;
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
  productsInfinite: ({
    query,
    sortBy,
    sortDirection,
    filters,
    first = SEARCH_PAGE_SIZE,
  }: {
    query: string;
    sortBy: SearchSortBy;
    sortDirection: SearchSortDirection;
    filters: ProductFilter[];
    first?: number;
  }) =>
    infiniteQueryOptions({
      queryKey: [
        "search",
        "products",
        query,
        sortBy,
        sortDirection,
        filters,
        first,
      ] as const,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TanStack Query requires initialPageParam to carry the full page-param union type
      initialPageParam: undefined as string | undefined,
      queryFn: async ({ pageParam }) => {
        const response = await shopify.request(searchProducts, {
          variables: {
            query,
            sortKey: getSearchSortKey(sortBy),
            reverse: sortDirection === "desc",
            productFilters: filters,
            first,
            after: pageParam,
          },
        });

        return response.data?.search;
      },
      getNextPageParam: (lastPage) => {
        if (
          lastPage?.pageInfo.hasNextPage === false ||
          lastPage?.pageInfo.endCursor === null
        ) {
          return undefined;
        }

        return lastPage?.pageInfo.endCursor ?? undefined;
      },
    }),
};
