import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { getProductsByIds } from "@acme/shopify/storefront/product";

import type { LiveOrderProducts } from "~/features/account/types";
import { getCustomerOrdersPage } from "~/features/account/server/get-customer-orders";
import { shopify } from "~/lib/shopify";

const ORDERS_PAGE_SIZE = 10;

export const accountQueries = {
  all: () => ({
    queryKey: ["account"] as const,
  }),
  orders: () =>
    infiniteQueryOptions({
      queryKey: [...accountQueries.all().queryKey, "orders"] as const,
      queryFn: ({ pageParam }) =>
        getCustomerOrdersPage({
          data: {
            after: pageParam,
            first: ORDERS_PAGE_SIZE,
          },
        }),
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- TanStack Query requires initialPageParam to carry the full page-param union type
      initialPageParam: null as string | null,
      getNextPageParam: (lastPage) => {
        if (lastPage.pageInfo.hasNextPage === false) {
          return undefined;
        }

        return lastPage.pageInfo.endCursor ?? undefined;
      },
    }),
  liveProducts: (ids: string[]) =>
    queryOptions({
      queryKey: [
        ...accountQueries.all().queryKey,
        "live-products",
        ids,
      ] as const,
      queryFn: async (): Promise<LiveOrderProducts> => {
        if (ids.length === 0) {
          return [];
        }

        const response = await shopify.request(getProductsByIds, {
          variables: {
            ids,
          },
        });

        return response.data?.nodes ?? [];
      },
    }),
};
