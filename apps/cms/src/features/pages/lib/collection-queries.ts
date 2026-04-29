import { queryOptions } from "@tanstack/react-query";

import { searchCollections } from "@acme/shopify/storefront/collection";

import { shopify } from "~/lib/shopify";

const COLLECTION_SEARCH_LIMIT = 10;

export const collectionQueries = {
  search: (query: string) =>
    queryOptions({
      queryKey: ["shopify", "collections", "search", query] as const,
      queryFn: async () => {
        const response = await shopify.request(searchCollections, {
          variables: {
            first: COLLECTION_SEARCH_LIMIT,
            query: query || undefined,
          },
        });

        return response.data ?? null;
      },
    }),
};
