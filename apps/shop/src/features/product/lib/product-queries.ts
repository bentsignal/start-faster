import { notFound } from "@tanstack/react-router";

import type { GetProductsByCollectionQueryVariables } from "@acme/shopify/storefront/generated";
import {
  getProduct,
  getProductsByCollection,
} from "@acme/shopify/storefront/product";

import { shopify } from "~/lib/shopify";

export const productQueries = {
  productByHandle: (handle: string) => ({
    queryKey: ["product", handle],
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
  getProductsByCollection: (
    variables: GetProductsByCollectionQueryVariables,
  ) => ({
    queryKey: ["products", "collection", variables],
    queryFn: async () => {
      const response = await shopify.request(getProductsByCollection, {
        variables,
      });
      return response.data?.collection ?? null;
    },
  }),
};
