import { v } from "convex/values";

import type { QueryCtx } from "./_generated/server";
import { query } from "./_generated/server";

const featuredImageValidator = v.optional(
  v.object({
    url: v.string(),
    altText: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  }),
);

const productOptionValidator = v.object({
  name: v.string(),
  values: v.array(v.string()),
});

const selectedOptionValidator = v.object({
  name: v.string(),
  value: v.string(),
});

const variantValidator = v.object({
  shopifyVariantId: v.string(),
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

const collectionValidator = v.object({
  shopifyCollectionId: v.string(),
  handle: v.string(),
  title: v.string(),
  description: v.string(),
  image: featuredImageValidator,
  updatedAt: v.string(),
});

const productValidator = v.object({
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
  featuredImage: featuredImageValidator,
  options: v.array(productOptionValidator),
  minPriceAmount: v.string(),
  maxPriceAmount: v.string(),
  currencyCode: v.string(),
  publishedAt: v.optional(v.string()),
  updatedAt: v.string(),
  variants: v.array(variantValidator),
  collections: v.array(collectionValidator),
});

const listProductsReturnValidator = v.object({
  page: v.array(productValidator),
  nextCursor: v.union(v.string(), v.null()),
});

interface ProductDoc {
  shopifyProductId: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  status: "active" | "archived" | "draft";
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };
  options: {
    name: string;
    values: string[];
  }[];
  minPriceAmount: string;
  maxPriceAmount: string;
  currencyCode: string;
  publishedAt?: string;
  updatedAt: string;
}

async function hydrateProduct(ctx: QueryCtx, product: ProductDoc) {
  const variants = await ctx.db
    .query("variants")
    .withIndex("by_product", (q) => q.eq("shopifyProductId", product.shopifyProductId))
    .collect();
  const links = await ctx.db
    .query("productCollections")
    .withIndex("by_product", (q) => q.eq("shopifyProductId", product.shopifyProductId))
    .collect();

  const collections = await Promise.all(
    links.map(async (link) => {
      const collection = await ctx.db
        .query("collections")
        .withIndex("by_shopify_collection_id", (q) =>
          q.eq("shopifyCollectionId", link.shopifyCollectionId),
        )
        .unique();
      if (!collection || collection.deletedAt) {
        return null;
      }
      return {
        shopifyCollectionId: collection.shopifyCollectionId,
        handle: collection.handle,
        title: collection.title,
        description: collection.description,
        image: collection.image,
        updatedAt: collection.updatedAt,
      };
    }),
  );

  return {
    shopifyProductId: product.shopifyProductId,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    status: product.status,
    vendor: product.vendor,
    productType: product.productType,
    tags: product.tags,
    featuredImage: product.featuredImage,
    options: product.options,
    minPriceAmount: product.minPriceAmount,
    maxPriceAmount: product.maxPriceAmount,
    currencyCode: product.currencyCode,
    publishedAt: product.publishedAt,
    updatedAt: product.updatedAt,
    variants: variants
      .filter((variant) => !variant.deletedAt)
      .map((variant) => ({
        shopifyVariantId: variant.shopifyVariantId,
        sku: variant.sku,
        title: variant.title,
        availableForSale: variant.availableForSale,
        selectedOptions: variant.selectedOptions,
        priceAmount: variant.priceAmount,
        compareAtPriceAmount: variant.compareAtPriceAmount,
        currencyCode: variant.currencyCode,
        inventoryPolicy: variant.inventoryPolicy,
        updatedAt: variant.updatedAt,
      })),
    collections: collections.filter(
      (collection): collection is NonNullable<typeof collection> =>
        collection !== null,
    ),
  };
}

export const listProducts = query({
  args: {
    status: v.optional(
      v.union(v.literal("active"), v.literal("archived"), v.literal("draft")),
    ),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: listProductsReturnValidator,
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 24, 100));
    if (args.status === undefined) {
      const result = await ctx.db
        .query("products")
        .withIndex("by_updated_at")
        .order("desc")
        .paginate({
          numItems: limit,
          cursor: args.cursor ?? null,
        });
      const visibleProducts = result.page.filter((product) => !product.deletedAt);
      const hydrated = await Promise.all(
        visibleProducts.map((product) => hydrateProduct(ctx, product)),
      );
      return {
        page: hydrated,
        nextCursor: result.isDone ? null : result.continueCursor,
      };
    } else {
      const status = args.status;
      const result = await ctx.db
        .query("products")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .paginate({
          numItems: limit,
          cursor: args.cursor ?? null,
        });
      const visibleProducts = result.page.filter((product) => !product.deletedAt);
      const hydrated = await Promise.all(
        visibleProducts.map((product) => hydrateProduct(ctx, product)),
      );
      return {
        page: hydrated,
        nextCursor: result.isDone ? null : result.continueCursor,
      };
    }
  },
});

export const getProductByHandle = query({
  args: {
    handle: v.string(),
  },
  returns: v.union(productValidator, v.null()),
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (!product || product.deletedAt) {
      return null;
    }
    return await hydrateProduct(ctx, product);
  },
});

export const listCollections = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  returns: v.object({
    page: v.array(collectionValidator),
    nextCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 24, 100));
    const result = await ctx.db
      .query("collections")
      .withIndex("by_updated_at")
      .order("desc")
      .paginate({
        numItems: limit,
        cursor: args.cursor ?? null,
      });

    return {
      page: result.page
        .filter((collection) => !collection.deletedAt)
        .map((collection) => ({
          shopifyCollectionId: collection.shopifyCollectionId,
          handle: collection.handle,
          title: collection.title,
          description: collection.description,
          image: collection.image,
          updatedAt: collection.updatedAt,
        })),
      nextCursor: result.isDone ? null : result.continueCursor,
    };
  },
});
