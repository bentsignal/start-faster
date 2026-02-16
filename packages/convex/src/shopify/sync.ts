import { v } from "convex/values";

import { internalMutation } from "../_generated/server";
import {
  collectionSnapshotValidator,
  productSnapshotValidator,
} from "./validators";

export const upsertCatalogSnapshot = internalMutation({
  args: {
    source: v.union(v.literal("webhook"), v.literal("reconcile")),
    replaceAssociations: v.boolean(),
    replaceVariants: v.boolean(),
    products: v.array(productSnapshotValidator),
    collections: v.array(collectionSnapshotValidator),
  },
  returns: v.object({
    productsUpserted: v.number(),
    collectionsUpserted: v.number(),
    variantsUpserted: v.number(),
  }),
  handler: async (ctx, args) => {
    let productsUpserted = 0;
    let collectionsUpserted = 0;
    let variantsUpserted = 0;

    for (const collection of args.collections) {
      const existing = await ctx.db
        .query("collections")
        .withIndex("by_shopify_collection_id", (q) =>
          q.eq("shopifyCollectionId", collection.shopifyCollectionId),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          handle: collection.handle,
          title: collection.title,
          description: collection.description,
          image: collection.image,
          updatedAt: collection.updatedAt,
          deletedAt: undefined,
        });
      } else {
        await ctx.db.insert("collections", {
          shopifyCollectionId: collection.shopifyCollectionId,
          handle: collection.handle,
          title: collection.title,
          description: collection.description,
          image: collection.image,
          updatedAt: collection.updatedAt,
          deletedAt: undefined,
        });
      }

      collectionsUpserted += 1;
    }

    for (const product of args.products) {
      const existingProduct = await ctx.db
        .query("products")
        .withIndex("by_shopify_product_id", (q) =>
          q.eq("shopifyProductId", product.shopifyProductId),
        )
        .unique();

      if (existingProduct) {
        await ctx.db.patch(existingProduct._id, {
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
          deletedAt: undefined,
        });
      } else {
        await ctx.db.insert("products", {
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
          deletedAt: undefined,
        });
      }
      productsUpserted += 1;

      if (args.replaceVariants) {
        const existingVariants = await ctx.db
          .query("variants")
          .withIndex("by_product", (q) =>
            q.eq("shopifyProductId", product.shopifyProductId),
          )
          .collect();
        const keepVariantIds = new Set(
          product.variants.map((variant) => variant.shopifyVariantId),
        );
        for (const variant of existingVariants) {
          if (!keepVariantIds.has(variant.shopifyVariantId)) {
            await ctx.db.patch(variant._id, {
              deletedAt: product.updatedAt,
            });
          }
        }
      }

      for (const variant of product.variants) {
        const existingVariant = await ctx.db
          .query("variants")
          .withIndex("by_shopify_variant_id", (q) =>
            q.eq("shopifyVariantId", variant.shopifyVariantId),
          )
          .unique();

        if (existingVariant) {
          await ctx.db.patch(existingVariant._id, {
            shopifyProductId: variant.shopifyProductId,
            sku: variant.sku,
            title: variant.title,
            availableForSale: variant.availableForSale,
            selectedOptions: variant.selectedOptions,
            priceAmount: variant.priceAmount,
            compareAtPriceAmount: variant.compareAtPriceAmount,
            currencyCode: variant.currencyCode,
            inventoryPolicy: variant.inventoryPolicy,
            updatedAt: variant.updatedAt,
            deletedAt: undefined,
          });
        } else {
          await ctx.db.insert("variants", {
            shopifyVariantId: variant.shopifyVariantId,
            shopifyProductId: variant.shopifyProductId,
            sku: variant.sku,
            title: variant.title,
            availableForSale: variant.availableForSale,
            selectedOptions: variant.selectedOptions,
            priceAmount: variant.priceAmount,
            compareAtPriceAmount: variant.compareAtPriceAmount,
            currencyCode: variant.currencyCode,
            inventoryPolicy: variant.inventoryPolicy,
            updatedAt: variant.updatedAt,
            deletedAt: undefined,
          });
        }

        variantsUpserted += 1;
      }

      if (args.replaceAssociations && product.collectionShopifyIds) {
        const existingLinks = await ctx.db
          .query("productCollections")
          .withIndex("by_product", (q) =>
            q.eq("shopifyProductId", product.shopifyProductId),
          )
          .collect();
        for (const link of existingLinks) {
          await ctx.db.delete(link._id);
        }

        const seen = new Set<string>();
        for (const collectionId of product.collectionShopifyIds) {
          if (seen.has(collectionId)) {
            continue;
          }
          seen.add(collectionId);
          await ctx.db.insert("productCollections", {
            shopifyProductId: product.shopifyProductId,
            shopifyCollectionId: collectionId,
          });
        }
      }
    }

    return { productsUpserted, collectionsUpserted, variantsUpserted };
  },
});

export const deleteProductByShopifyId = internalMutation({
  args: {
    shopifyProductId: v.string(),
    deletedAt: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_shopify_product_id", (q) =>
        q.eq("shopifyProductId", args.shopifyProductId),
      )
      .unique();
    if (!product) {
      return false;
    }

    await ctx.db.patch(product._id, { deletedAt: args.deletedAt });

    const variants = await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("shopifyProductId", args.shopifyProductId))
      .collect();
    for (const variant of variants) {
      await ctx.db.patch(variant._id, { deletedAt: args.deletedAt });
    }

    const links = await ctx.db
      .query("productCollections")
      .withIndex("by_product", (q) => q.eq("shopifyProductId", args.shopifyProductId))
      .collect();
    for (const link of links) {
      await ctx.db.delete(link._id);
    }
    return true;
  },
});

export const deleteCollectionByShopifyId = internalMutation({
  args: {
    shopifyCollectionId: v.string(),
    deletedAt: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const collection = await ctx.db
      .query("collections")
      .withIndex("by_shopify_collection_id", (q) =>
        q.eq("shopifyCollectionId", args.shopifyCollectionId),
      )
      .unique();
    if (!collection) {
      return false;
    }
    await ctx.db.patch(collection._id, { deletedAt: args.deletedAt });

    const links = await ctx.db
      .query("productCollections")
      .withIndex("by_collection", (q) =>
        q.eq("shopifyCollectionId", args.shopifyCollectionId),
      )
      .collect();
    for (const link of links) {
      await ctx.db.delete(link._id);
    }
    return true;
  },
});

export const purgeDeletedData = internalMutation({
  args: {
    olderThanMs: v.number(),
  },
  returns: v.object({
    productsDeleted: v.number(),
    variantsDeleted: v.number(),
    collectionsDeleted: v.number(),
  }),
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const products = await ctx.db
      .query("products")
      .withIndex("by_updated_at")
      .collect();
    const variants = await ctx.db
      .query("variants")
      .withIndex("by_updated_at")
      .collect();
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_updated_at")
      .collect();

    let productsDeleted = 0;
    let variantsDeleted = 0;
    let collectionsDeleted = 0;

    for (const product of products) {
      if (!product.deletedAt) {
        continue;
      }
      const deletedAtMs = Date.parse(product.deletedAt);
      if (Number.isNaN(deletedAtMs) || deletedAtMs > cutoff) {
        continue;
      }
      const productVariants = await ctx.db
        .query("variants")
        .withIndex("by_product", (q) => q.eq("shopifyProductId", product.shopifyProductId))
        .collect();
      for (const variant of productVariants) {
        await ctx.db.delete(variant._id);
        variantsDeleted += 1;
      }
      const links = await ctx.db
        .query("productCollections")
        .withIndex("by_product", (q) => q.eq("shopifyProductId", product.shopifyProductId))
        .collect();
      for (const link of links) {
        await ctx.db.delete(link._id);
      }
      await ctx.db.delete(product._id);
      productsDeleted += 1;
    }

    for (const variant of variants) {
      if (!variant.deletedAt) {
        continue;
      }
      const deletedAtMs = Date.parse(variant.deletedAt);
      if (Number.isNaN(deletedAtMs) || deletedAtMs > cutoff) {
        continue;
      }
      await ctx.db.delete(variant._id);
      variantsDeleted += 1;
    }

    for (const collection of collections) {
      if (!collection.deletedAt) {
        continue;
      }
      const deletedAtMs = Date.parse(collection.deletedAt);
      if (Number.isNaN(deletedAtMs) || deletedAtMs > cutoff) {
        continue;
      }
      const links = await ctx.db
        .query("productCollections")
        .withIndex("by_collection", (q) =>
          q.eq("shopifyCollectionId", collection.shopifyCollectionId),
        )
        .collect();
      for (const link of links) {
        await ctx.db.delete(link._id);
      }
      await ctx.db.delete(collection._id);
      collectionsDeleted += 1;
    }

    return { productsDeleted, variantsDeleted, collectionsDeleted };
  },
});
