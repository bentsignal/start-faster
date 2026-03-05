import type {
  GetQuery,
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

export type HomeCollectionProductNode = NonNullable<
  NonNullable<GetQuery["collection"]>["products"]["nodes"][number]
>;

export type ProductResultNode =
  | SearchResultProductNode
  | HomeCollectionProductNode;
