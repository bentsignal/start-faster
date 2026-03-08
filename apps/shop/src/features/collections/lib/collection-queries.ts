import { infiniteQueryOptions } from "@tanstack/react-query";

import type { ProductFilter } from "@acme/shopify/storefront/types";
import { getProductsByCollection } from "@acme/shopify/storefront/product";
import { ProductCollectionSortKeys } from "@acme/shopify/storefront/types";

import { shopify } from "~/lib/shopify";

export const COLLECTION_PAGE_SIZE = 30;

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
  productsInfinite: ({
    handle,
    sortBy,
    sortDirection,
    filters,
    first = COLLECTION_PAGE_SIZE,
  }: {
    handle: string;
    sortBy: CollectionSortBy;
    sortDirection: CollectionSortDirection;
    filters: ProductFilter[];
    first?: number;
  }) =>
    infiniteQueryOptions({
      queryKey: [
        "collection",
        "products",
        handle,
        sortBy,
        sortBy === "price" ? sortDirection : undefined,
        filters,
        first,
      ] as const,
      initialPageParam: undefined as string | undefined,
      queryFn: async ({ pageParam }) => {
        const response = await shopify.request(getProductsByCollection, {
          variables: {
            handle,
            sortKey: getCollectionSortKey(sortBy),
            reverse: sortBy === "price" ? sortDirection === "desc" : false,
            filters,
            first,
            after: pageParam,
          },
        });

        return response.data?.collection;
      },
      getNextPageParam: (lastPage) => {
        if (
          lastPage?.products.pageInfo.hasNextPage === false ||
          lastPage?.products.pageInfo.endCursor === null
        ) {
          return undefined;
        }

        return lastPage?.products.pageInfo.endCursor ?? undefined;
      },
    }),
};
