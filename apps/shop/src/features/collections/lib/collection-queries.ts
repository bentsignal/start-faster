import { infiniteQueryOptions } from "@tanstack/react-query";

import type { ProductFilter } from "@acme/shopify/storefront/types";
import { getProductsByCollection } from "@acme/shopify/storefront/product";
import { ProductCollectionSortKeys } from "@acme/shopify/storefront/types";

import type {
  SortBy,
  SortDirection,
} from "~/features/shared/filters/sort-schemas";
import { shopify } from "~/lib/shopify";

export const COLLECTION_PAGE_SIZE = 30;

function getCollectionSortKey(sortBy: SortBy) {
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
    sortBy: SortBy;
    sortDirection: SortDirection;
    filters: ProductFilter[];
    first?: number;
  }) =>
    infiniteQueryOptions({
      queryKey: [
        "collection",
        "products",
        handle,
        sortBy,
        sortDirection,
        filters,
        first,
      ] as const,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TanStack Query requires initialPageParam to carry the full page-param union type
      initialPageParam: undefined as string | undefined,
      queryFn: async ({ pageParam }) => {
        const response = await shopify.request(getProductsByCollection, {
          variables: {
            handle,
            sortKey: getCollectionSortKey(sortBy),
            reverse: sortDirection === "desc",
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
