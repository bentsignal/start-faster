import { notFound } from "@tanstack/react-router";

import type { GetQueryVariables } from "@acme/shopify/storefront/generated";
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
  productsFromCollection: (variables: GetQueryVariables) => ({
    queryKey: ["products", "collection", variables.handle, variables.first],
    queryFn: async () => {
      const response = await shopify.request(getProductsByCollection, {
        variables,
      });
      return response.data?.collection?.products.nodes ?? [];
    },
  }),
};
