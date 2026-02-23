import type { ProductByHandleQuery } from "@acme/shopify/storefront/generated";

export type Product = NonNullable<ProductByHandleQuery["product"]>;

export interface ProductGalleryImage {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}
