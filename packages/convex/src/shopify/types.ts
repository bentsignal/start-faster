export interface ShopifyImage {
  url: string;
  altText?: string;
  width?: number;
  height?: number;
}

export interface ShopifyProductOption {
  name: string;
  values: string[];
}

export interface ShopifyVariantSnapshot {
  shopifyVariantId: string;
  shopifyProductId: string;
  sku?: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  priceAmount: string;
  compareAtPriceAmount?: string;
  currencyCode: string;
  inventoryPolicy?: string;
  updatedAt: string;
}

export interface ShopifyProductSnapshot {
  shopifyProductId: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  status: "active" | "archived" | "draft";
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage?: ShopifyImage;
  options: ShopifyProductOption[];
  minPriceAmount: string;
  maxPriceAmount: string;
  currencyCode: string;
  publishedAt?: string;
  updatedAt: string;
  variants: ShopifyVariantSnapshot[];
  collectionShopifyIds?: string[];
}

export interface ShopifyCollectionSnapshot {
  shopifyCollectionId: string;
  handle: string;
  title: string;
  description: string;
  image?: ShopifyImage;
  updatedAt: string;
}

export interface ShopifyCartLineInput {
  merchandiseId: string;
  quantity: number;
}
