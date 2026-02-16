import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema(
  {
    products: defineTable({
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
      featuredImage: v.optional(
        v.object({
          url: v.string(),
          altText: v.optional(v.string()),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
        }),
      ),
      options: v.array(
        v.object({
          name: v.string(),
          values: v.array(v.string()),
        }),
      ),
      minPriceAmount: v.string(),
      maxPriceAmount: v.string(),
      currencyCode: v.string(),
      publishedAt: v.optional(v.string()),
      updatedAt: v.string(),
      deletedAt: v.optional(v.string()),
    })
      .index("by_shopify_product_id", ["shopifyProductId"])
      .index("by_handle", ["handle"])
      .index("by_status", ["status"])
      .index("by_updated_at", ["updatedAt"]),
    variants: defineTable({
      shopifyVariantId: v.string(),
      shopifyProductId: v.string(),
      sku: v.optional(v.string()),
      title: v.string(),
      availableForSale: v.boolean(),
      selectedOptions: v.array(
        v.object({
          name: v.string(),
          value: v.string(),
        }),
      ),
      priceAmount: v.string(),
      compareAtPriceAmount: v.optional(v.string()),
      currencyCode: v.string(),
      inventoryPolicy: v.optional(v.string()),
      updatedAt: v.string(),
      deletedAt: v.optional(v.string()),
    })
      .index("by_shopify_variant_id", ["shopifyVariantId"])
      .index("by_product", ["shopifyProductId"])
      .index("by_product_and_available", ["shopifyProductId", "availableForSale"])
      .index("by_updated_at", ["updatedAt"]),
    collections: defineTable({
      shopifyCollectionId: v.string(),
      handle: v.string(),
      title: v.string(),
      description: v.string(),
      image: v.optional(
        v.object({
          url: v.string(),
          altText: v.optional(v.string()),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
        }),
      ),
      updatedAt: v.string(),
      deletedAt: v.optional(v.string()),
    })
      .index("by_shopify_collection_id", ["shopifyCollectionId"])
      .index("by_handle", ["handle"])
      .index("by_updated_at", ["updatedAt"]),
    productCollections: defineTable({
      shopifyProductId: v.string(),
      shopifyCollectionId: v.string(),
    })
      .index("by_product_and_collection", [
        "shopifyProductId",
        "shopifyCollectionId",
      ])
      .index("by_collection_and_product", [
        "shopifyCollectionId",
        "shopifyProductId",
      ])
      .index("by_product", ["shopifyProductId"])
      .index("by_collection", ["shopifyCollectionId"]),
    syncState: defineTable({
      key: v.string(),
      cursor: v.optional(v.string()),
      lastRunAt: v.optional(v.number()),
      lastSuccessAt: v.optional(v.number()),
      metadata: v.optional(v.record(v.string(), v.string())),
    }).index("by_key", ["key"]),
    webhookEvents: defineTable({
      deliveryId: v.string(),
      topic: v.string(),
      shopDomain: v.string(),
      triggeredAt: v.optional(v.string()),
      payload: v.string(),
      payloadHash: v.string(),
      status: v.union(
        v.literal("queued"),
        v.literal("processed"),
        v.literal("failed"),
        v.literal("duplicate"),
      ),
      processedAt: v.optional(v.number()),
      error: v.optional(v.string()),
    })
      .index("by_delivery_id", ["deliveryId"])
      .index("by_processed_at", ["processedAt"]),
  },
  { schemaValidation: true },
);
