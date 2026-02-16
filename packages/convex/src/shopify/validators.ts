import { v } from "convex/values";

export const imageValidator = v.object({
  url: v.string(),
  altText: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
});

export const productOptionValidator = v.object({
  name: v.string(),
  values: v.array(v.string()),
});

export const selectedOptionValidator = v.object({
  name: v.string(),
  value: v.string(),
});

export const variantSnapshotValidator = v.object({
  shopifyVariantId: v.string(),
  shopifyProductId: v.string(),
  sku: v.optional(v.string()),
  title: v.string(),
  availableForSale: v.boolean(),
  selectedOptions: v.array(selectedOptionValidator),
  priceAmount: v.string(),
  compareAtPriceAmount: v.optional(v.string()),
  currencyCode: v.string(),
  inventoryPolicy: v.optional(v.string()),
  updatedAt: v.string(),
});

export const productSnapshotValidator = v.object({
  shopifyProductId: v.string(),
  handle: v.string(),
  title: v.string(),
  description: v.string(),
  descriptionHtml: v.string(),
  status: v.union(
    v.literal("active"),
    v.literal("archived"),
    v.literal("draft"),
  ),
  vendor: v.string(),
  productType: v.string(),
  tags: v.array(v.string()),
  featuredImage: v.optional(imageValidator),
  options: v.array(productOptionValidator),
  minPriceAmount: v.string(),
  maxPriceAmount: v.string(),
  currencyCode: v.string(),
  publishedAt: v.optional(v.string()),
  updatedAt: v.string(),
  variants: v.array(variantSnapshotValidator),
  collectionShopifyIds: v.optional(v.array(v.string())),
});

export const collectionSnapshotValidator = v.object({
  shopifyCollectionId: v.string(),
  handle: v.string(),
  title: v.string(),
  description: v.string(),
  image: v.optional(imageValidator),
  updatedAt: v.string(),
});
