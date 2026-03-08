import type { QueryClient } from "@tanstack/react-query";

import type { ProductFilter } from "@acme/shopify/storefront/types";
import { getProductsByCollection } from "@acme/shopify/storefront/product";
import { ProductCollectionSortKeys } from "@acme/shopify/storefront/types";

import { shopify } from "~/lib/shopify";

export const COLLECTION_PAGE_SIZE = 30;
export const MAX_COLLECTION_PAGE = 50;
export const MAX_COLLECTION_PAGE_ITERATIONS = MAX_COLLECTION_PAGE - 1;

export type CollectionSortBy = "relevance" | "price";
export type CollectionSortDirection = "asc" | "desc";

function getCollectionSortKey(
  sortBy: CollectionSortBy,
): ProductCollectionSortKeys {
  if (sortBy === "price") {
    return ProductCollectionSortKeys.Price;
  }

  return ProductCollectionSortKeys.CollectionDefault;
}

export const collectionQueries = {
  productsPage: ({
    handle,
    sortBy,
    sortDirection,
    filters,
    first,
    after,
    before,
  }: {
    handle: string;
    sortBy: CollectionSortBy;
    sortDirection: CollectionSortDirection;
    filters: ProductFilter[];
    first: number;
    after?: string;
    before?: string;
  }) => ({
    queryKey: [
      "collection",
      "products",
      handle,
      sortBy,
      sortBy === "price" ? sortDirection : undefined,
      filters,
      first,
      after,
      before,
    ] as const,
    queryFn: async () => {
      const response = await shopify.request(getProductsByCollection, {
        variables: {
          handle,
          sortKey: getCollectionSortKey(sortBy),
          reverse: sortBy === "price" ? sortDirection === "desc" : false,
          filters,
          first,
          after,
          before,
        },
      });

      return response.data?.collection;
    },
  }),
  resolveCursorForPage: async ({
    queryClient,
    page,
    handle,
    sortBy,
    sortDirection,
    filters,
  }: {
    queryClient?: QueryClient;
    page: number;
    handle: string;
    sortBy: CollectionSortBy;
    sortDirection: CollectionSortDirection;
    filters: ProductFilter[];
  }) => {
    if (page <= 1) {
      return undefined;
    }

    if (page > MAX_COLLECTION_PAGE) {
      return undefined;
    }

    let currentPage = 1;
    let cursor: string | undefined;
    let iterationCount = 0;

    while (currentPage < page) {
      if (iterationCount >= MAX_COLLECTION_PAGE_ITERATIONS) {
        return undefined;
      }

      const collectionProductsQuery = collectionQueries.productsPage({
        handle,
        sortBy,
        sortDirection,
        filters,
        first: COLLECTION_PAGE_SIZE,
        after: cursor,
      });

      const result = queryClient
        ? await queryClient.ensureQueryData(collectionProductsQuery)
        : await collectionProductsQuery.queryFn();

      if (result === null || result === undefined) {
        return undefined;
      }

      const nextCursor = result.products.pageInfo.endCursor ?? undefined;
      if (
        nextCursor === undefined ||
        result.products.pageInfo.hasNextPage === false
      ) {
        return undefined;
      }

      cursor = nextCursor;
      currentPage += 1;
      iterationCount += 1;
    }

    return cursor;
  },
};
