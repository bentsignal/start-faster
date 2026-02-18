import { createServerFn } from "@tanstack/react-start";

import type {
  ProductByHandleQueryVariables,
  ProductsByCollectionHandleQueryVariables,
} from "~/lib/shopify/generated/storefront.generated";
import { storefrontRequest } from "~/lib/shopify/storefront.server";

const productByHandleQuery = `#graphql
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

const productsByCollectionHandleQuery = `#graphql
  query ProductsByCollectionHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const getProductByHandle = createServerFn({ method: "GET" })
  .inputValidator((value: ProductByHandleQueryVariables) => value)
  .handler(async ({ data }) => {
    const result = await storefrontRequest(productByHandleQuery, {
      handle: data.handle,
    });
    return result.product;
  });

export const getProductsByCollectionHandle = createServerFn({ method: "GET" })
  .inputValidator((value: ProductsByCollectionHandleQueryVariables) => value)
  .handler(async ({ data }) => {
    const result = await storefrontRequest(productsByCollectionHandleQuery, {
      handle: data.handle,
      first: data.first,
    });
    if (!result.collection) {
      throw new Error(
        `Shopify collection "${data.handle}" not found. Verify the collection handle and ensure the collection is published to the sales channel used by your Storefront token.`,
      );
    }
    return result;
  });
