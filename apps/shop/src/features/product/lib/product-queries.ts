import { queryOptions } from "@tanstack/react-query";
import { notFound } from "@tanstack/react-router";

import type { GetProductsByCollectionQueryVariables } from "@acme/shopify/storefront/generated";
import {
  getProduct,
  getProductsByCollection,
} from "@acme/shopify/storefront/product";

import { shopify } from "~/lib/shopify";

export const frontpageCollectionArgs = {
  handle: "frontpage",
  first: 24,
} as const satisfies GetProductsByCollectionQueryVariables;

export const productQueries = {
  productByHandle: (handle: string) =>
    queryOptions({
      queryKey: ["product", handle] as const,
      queryFn: async () => {
        const response = await shopify.request(getProduct, {
          variables: { handle },
        });
        const product = response.data?.product;

        if (product === null || product === undefined) {
          throw notFound();
        }

        return product;
      },
    }),
  getProductsByCollection: (variables: GetProductsByCollectionQueryVariables) =>
    queryOptions({
      queryKey: ["products", "collection", variables] as const,
      queryFn: async () => {
        const response = await shopify.request(getProductsByCollection, {
          variables,
        });

        return response.data?.collection ?? null;
      },
    }),
};
