import type { GetProductsByCollectionQuery } from "@acme/shopify/storefront/generated";

export type CollectionData = NonNullable<
  GetProductsByCollectionQuery["collection"]
>;

export type CollectionProductNode = CollectionData["products"]["nodes"][number];

export type CollectionFilter = CollectionData["products"]["filters"][number];
