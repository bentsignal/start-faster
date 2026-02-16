"use node";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { fetchCollectionsUpdatedSince, fetchProductsUpdatedSince } from "./admin";
import { maxIso, mergeCursor } from "./reconcileUtils";

const PRODUCTS_STATE_KEY = "shopify_products_reconcile";
const COLLECTIONS_STATE_KEY = "shopify_collections_reconcile";

export const reconcileCatalog = internalAction({
  args: {
    full: v.optional(v.boolean()),
    productPageSize: v.optional(v.number()),
    collectionPageSize: v.optional(v.number()),
  },
  returns: v.object({
    productsUpserted: v.number(),
    collectionsUpserted: v.number(),
    variantsUpserted: v.number(),
    productsPages: v.number(),
    collectionsPages: v.number(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const productState: {
      cursor?: string;
    } | null = await ctx.runQuery(internal.shopify.state.getSyncState, {
      key: PRODUCTS_STATE_KEY,
    });
    const collectionState: {
      cursor?: string;
    } | null = await ctx.runQuery(internal.shopify.state.getSyncState, {
      key: COLLECTIONS_STATE_KEY,
    });

    const productUpdatedSince = args.full ? undefined : productState?.cursor;
    const collectionUpdatedSince = args.full ? undefined : collectionState?.cursor;

    let productsUpserted = 0;
    let collectionsUpserted = 0;
    let variantsUpserted = 0;
    let productsPages = 0;
    let collectionsPages = 0;
    let productCursor: string | undefined;
    let collectionCursor: string | undefined;

    while (true) {
      const page = await fetchProductsUpdatedSince({
        updatedSince: productUpdatedSince,
        cursor: productCursor,
        limit: args.productPageSize,
      });
      productsPages += 1;

      const result = await ctx.runMutation(internal.shopify.sync.upsertCatalogSnapshot, {
        source: "reconcile",
        replaceAssociations: true,
        replaceVariants: true,
        products: page.products,
        collections: [],
      });
      productsUpserted += result.productsUpserted;
      variantsUpserted += result.variantsUpserted;
      const latest = maxIso(page.products.map((product) => product.updatedAt));
      if (latest) {
        const persisted = mergeCursor(productState?.cursor, latest);
        if (persisted) {
          await ctx.runMutation(internal.shopify.state.upsertSyncState, {
            key: PRODUCTS_STATE_KEY,
            cursor: persisted,
            lastRunAt: now,
            lastSuccessAt: now,
            metadata: undefined,
          });
        }
      }
      if (!page.hasNextPage || !page.cursor) {
        break;
      }
      productCursor = page.cursor;
    }

    while (true) {
      const page = await fetchCollectionsUpdatedSince({
        updatedSince: collectionUpdatedSince,
        cursor: collectionCursor,
        limit: args.collectionPageSize,
      });
      collectionsPages += 1;

      const result = await ctx.runMutation(internal.shopify.sync.upsertCatalogSnapshot, {
        source: "reconcile",
        replaceAssociations: false,
        replaceVariants: false,
        products: [],
        collections: page.collections,
      });
      collectionsUpserted += result.collectionsUpserted;
      const latest = maxIso(page.collections.map((collection) => collection.updatedAt));
      if (latest) {
        const persisted = mergeCursor(collectionState?.cursor, latest);
        if (persisted) {
          await ctx.runMutation(internal.shopify.state.upsertSyncState, {
            key: COLLECTIONS_STATE_KEY,
            cursor: persisted,
            lastRunAt: now,
            lastSuccessAt: now,
            metadata: undefined,
          });
        }
      }
      if (!page.hasNextPage || !page.cursor) {
        break;
      }
      collectionCursor = page.cursor;
    }

    await ctx.runMutation(internal.shopify.sync.purgeDeletedData, {
      olderThanMs: 1000 * 60 * 60 * 24 * 14,
    });
    await ctx.runMutation(internal.shopify.webhookEvents.cleanupProcessedWebhookEvents, {
      olderThanMs: 1000 * 60 * 60 * 24 * 7,
    });

    return {
      productsUpserted,
      collectionsUpserted,
      variantsUpserted,
      productsPages,
      collectionsPages,
    };
  },
});
