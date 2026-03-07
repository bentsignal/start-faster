import type {
  GetProductsByCollectionQuery,
  ProductByHandleQuery,
  SearchProductsQuery,
} from "@acme/shopify/storefront/generated";

export type Product = NonNullable<ProductByHandleQuery["product"]>;

export interface ProductGalleryImage {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export type SearchResultProductNode = Extract<
  SearchProductsQuery["search"]["nodes"][number],
  { __typename: "Product" }
>;

export type CollectionProductNode = NonNullable<
  NonNullable<
    GetProductsByCollectionQuery["collection"]
  >["products"]["nodes"][number]
>;

export type ProductResultNode = SearchResultProductNode | CollectionProductNode;
