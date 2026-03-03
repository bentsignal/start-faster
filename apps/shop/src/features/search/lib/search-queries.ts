import type { SearchProductsQuery } from "@acme/shopify/storefront/generated";
import type {
  ProductFilter,
  SearchSortKeys,
} from "@acme/shopify/storefront/types";
import {
  getPredictiveSearch,
  searchProducts,
} from "@acme/shopify/storefront/search";

import type {
  PredictiveSearchProduct,
  PredictiveSearchSuggestion,
  SearchResultFilter,
  SearchResultPageInfo,
  SearchResultProductNode,
} from "~/features/search/types";
import { shopify } from "~/lib/shopify";

export const SEARCH_PAGE_SIZE = 40;

export type SearchSortBy = "relevance" | "price";
export type SearchSortDirection = "asc" | "desc";

const EMPTY_PAGE_INFO: SearchResultPageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

function getSearchSortKey(sortBy: SearchSortBy): SearchSortKeys {
  if (sortBy === "price") {
    return "PRICE" as SearchSortKeys;
  }

  return "RELEVANCE" as SearchSortKeys;
}

function extractProductNodes(
  nodes: SearchProductsQuery["search"]["nodes"],
): SearchResultProductNode[] {
  return nodes.filter(
    (node): node is SearchResultProductNode => node.__typename === "Product",
  );
}

function normalizePredictiveResult(data: {
  products: PredictiveSearchProduct[];
  suggestions: PredictiveSearchSuggestion[];
}) {
  return {
    products: data.products,
    suggestions: data.suggestions,
  };
}

export const searchQueries = {
  predictive: ({ query }: { query: string }) => ({
    queryKey: ["search", "predictive", query] as const,
    queryFn: async () => {
      const response = await shopify.request(getPredictiveSearch, {
        variables: {
          query,
          limit: 6,
        },
      });

      const payload = response.data?.predictiveSearch;
      return normalizePredictiveResult({
        products: payload?.products ?? [],
        suggestions: payload?.queries ?? [],
      });
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

      const payload = response.data?.search;

      return {
        products: extractProductNodes(payload?.nodes ?? []),
        pageInfo: payload?.pageInfo ?? EMPTY_PAGE_INFO,
        totalCount: payload?.totalCount ?? 0,
        productFilters: payload?.productFilters ?? ([] as SearchResultFilter[]),
      };
    },
  }),
  resolveCursorForPage: async ({
    page,
    query,
    sortBy,
    sortDirection,
    filters,
  }: {
    page: number;
    query: string;
    sortBy: SearchSortBy;
    sortDirection: SearchSortDirection;
    filters: ProductFilter[];
  }) => {
    if (page <= 1) {
      return undefined;
    }

    let currentPage = 1;
    let cursor: string | undefined;

    while (currentPage < page) {
      const result = await searchQueries
        .products({
          query,
          sortBy,
          sortDirection,
          filters,
          first: SEARCH_PAGE_SIZE,
          after: cursor,
        })
        .queryFn();

      const nextCursor = result.pageInfo.endCursor ?? undefined;
      if (nextCursor === undefined) {
        return undefined;
      }

      cursor = nextCursor;
      currentPage += 1;
    }

    return cursor;
  },
};
