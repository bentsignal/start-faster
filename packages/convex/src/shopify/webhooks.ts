"use node";

import { v } from "convex/values";

import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";
import { getShopifyWebhookSecret } from "./config";
import { payloadSha256, verifyWebhookSignature } from "./security";
import type {
  ShopifyCollectionSnapshot,
  ShopifyProductSnapshot,
  ShopifyVariantSnapshot,
} from "./types";

const toShopifyGid = (resource: "Product" | "ProductVariant" | "Collection", id: unknown) => {
  if (typeof id === "string" && id.startsWith("gid://")) {
    return id;
  }
  const normalized =
    typeof id === "string" || typeof id === "number" ? String(id).trim() : "";
  return `gid://shopify/${resource}/${normalized}`;
};

const parseTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => `${item}`.trim()).filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const parseStatus = (value: unknown): "active" | "archived" | "draft" => {
  if (value === "active" || value === "archived") {
    return value;
  }
  return "draft";
};

const mapVariantFromWebhook = (
  productId: string,
  value: Record<string, unknown>,
  updatedAt: string,
): ShopifyVariantSnapshot => {
  const id = toShopifyGid("ProductVariant", value.id);
  const priceAmount = typeof value.price === "string" ? value.price : "0";
  const compareAtPriceAmount =
    typeof value.compare_at_price === "string" ? value.compare_at_price : undefined;
  const currencyCode =
    typeof value.currency === "string" && value.currency.length > 0
      ? value.currency
      : "USD";
  const inventoryQuantity =
    typeof value.inventory_quantity === "number" ? value.inventory_quantity : 0;
  const inventoryPolicy =
    typeof value.inventory_policy === "string" ? value.inventory_policy : undefined;
  const selectedOptions = [
    { name: "option1", value: typeof value.option1 === "string" ? value.option1 : "" },
    { name: "option2", value: typeof value.option2 === "string" ? value.option2 : "" },
    { name: "option3", value: typeof value.option3 === "string" ? value.option3 : "" },
  ].filter((option) => option.value.length > 0);

  return {
    shopifyVariantId: id,
    shopifyProductId: productId,
    sku: typeof value.sku === "string" ? value.sku : undefined,
    title: typeof value.title === "string" ? value.title : "",
    availableForSale: inventoryQuantity > 0 || inventoryPolicy === "continue",
    selectedOptions,
    priceAmount,
    compareAtPriceAmount,
    currencyCode,
    inventoryPolicy,
    updatedAt,
  };
};

const mapProductFromWebhook = (payload: Record<string, unknown>): ShopifyProductSnapshot => {
  const productId = toShopifyGid("Product", payload.id);
  const updatedAt =
    typeof payload.updated_at === "string"
      ? payload.updated_at
      : new Date().toISOString();
  const variantsPayload = Array.isArray(payload.variants) ? payload.variants : [];
  const variants = variantsPayload
    .filter((variant): variant is Record<string, unknown> => !!variant && typeof variant === "object")
    .map((variant) => mapVariantFromWebhook(productId, variant, updatedAt));
  const prices = variants.map((variant) => Number(variant.priceAmount));
  const minPriceAmount = prices.length > 0 ? Math.min(...prices).toString() : "0";
  const maxPriceAmount = prices.length > 0 ? Math.max(...prices).toString() : "0";
  const optionsPayload = Array.isArray(payload.options) ? payload.options : [];
  const options = optionsPayload
    .filter((option): option is Record<string, unknown> => !!option && typeof option === "object")
    .map((option) => ({
      name: typeof option.name === "string" ? option.name : "",
      values: Array.isArray(option.values)
        ? option.values
            .map((value) => `${value}`.trim())
            .filter((value) => value.length > 0)
        : [],
    }));

  const imagePayload =
    payload.image && typeof payload.image === "object"
      ? (payload.image as Record<string, unknown>)
      : null;

  return {
    shopifyProductId: productId,
    handle: typeof payload.handle === "string" ? payload.handle : "",
    title: typeof payload.title === "string" ? payload.title : "",
    description: typeof payload.body_html === "string" ? payload.body_html : "",
    descriptionHtml: typeof payload.body_html === "string" ? payload.body_html : "",
    status: parseStatus(payload.status),
    vendor: typeof payload.vendor === "string" ? payload.vendor : "",
    productType: typeof payload.product_type === "string" ? payload.product_type : "",
    tags: parseTags(payload.tags),
    featuredImage: imagePayload
      ? {
          url: typeof imagePayload.src === "string" ? imagePayload.src : "",
          altText:
            typeof imagePayload.alt === "string" ? imagePayload.alt : undefined,
          width:
            typeof imagePayload.width === "number" ? imagePayload.width : undefined,
          height:
            typeof imagePayload.height === "number" ? imagePayload.height : undefined,
        }
      : undefined,
    options,
    minPriceAmount,
    maxPriceAmount,
    currencyCode: variants.at(0)?.currencyCode ?? "USD",
    publishedAt:
      typeof payload.published_at === "string" ? payload.published_at : undefined,
    updatedAt,
    variants,
  };
};

const mapCollectionFromWebhook = (
  payload: Record<string, unknown>,
): ShopifyCollectionSnapshot => {
  const imagePayload =
    payload.image && typeof payload.image === "object"
      ? (payload.image as Record<string, unknown>)
      : null;
  return {
    shopifyCollectionId: toShopifyGid("Collection", payload.id),
    handle: typeof payload.handle === "string" ? payload.handle : "",
    title: typeof payload.title === "string" ? payload.title : "",
    description: typeof payload.body_html === "string" ? payload.body_html : "",
    image: imagePayload
      ? {
          url: typeof imagePayload.src === "string" ? imagePayload.src : "",
          altText:
            typeof imagePayload.alt === "string" ? imagePayload.alt : undefined,
          width:
            typeof imagePayload.width === "number" ? imagePayload.width : undefined,
          height:
            typeof imagePayload.height === "number" ? imagePayload.height : undefined,
        }
      : undefined,
    updatedAt:
      typeof payload.updated_at === "string"
        ? payload.updated_at
        : new Date().toISOString(),
  };
};

export const verifyAndEnqueueWebhook = internalAction({
  args: {
    rawBody: v.string(),
    topic: v.string(),
    shopDomain: v.string(),
    deliveryId: v.string(),
    signature: v.string(),
    triggeredAt: v.optional(v.string()),
  },
  returns: v.object({
    accepted: v.boolean(),
    duplicate: v.boolean(),
  }),
  handler: async (ctx, args) => {
    if (
      !verifyWebhookSignature({
        payload: args.rawBody,
        secret: getShopifyWebhookSecret(),
        signature: args.signature,
      })
    ) {
      return { accepted: false, duplicate: false };
    }

    const payloadHash = payloadSha256(args.rawBody);

    const result: {
      accepted: boolean;
      eventId: string | null;
    } = await ctx.runMutation(internal.shopify.webhookEvents.enqueueWebhookEvent, {
      deliveryId: args.deliveryId,
      topic: args.topic,
      shopDomain: args.shopDomain,
      triggeredAt: args.triggeredAt,
      payload: args.rawBody,
      payloadHash,
    });

    return {
      accepted: result.accepted,
      duplicate: !result.accepted,
    };
  },
});

export const processQueuedWebhook = internalAction({
  args: {
    eventId: v.id("webhookEvents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event: {
      _id: Id<"webhookEvents">;
      topic: string;
      payload: string;
      triggeredAt?: string;
      status: "queued" | "processed" | "failed" | "duplicate";
    } | null = await ctx.runQuery(internal.shopify.webhookEvents.getWebhookEvent, {
      eventId: args.eventId,
    });
    if (!event || event.status === "processed") {
      return null;
    }

    try {
      const parsed = JSON.parse(event.payload) as Record<string, unknown>;
      const topic = event.topic.toLowerCase();
      const deletedAt = event.triggeredAt ?? new Date().toISOString();

      if (topic === "products/create" || topic === "products/update") {
        const product = mapProductFromWebhook(parsed);
        await ctx.runMutation(internal.shopify.sync.upsertCatalogSnapshot, {
          source: "webhook",
          replaceAssociations: false,
          replaceVariants: true,
          products: [product],
          collections: [],
        });
      } else if (topic === "products/delete") {
        await ctx.runMutation(internal.shopify.sync.deleteProductByShopifyId, {
          shopifyProductId: toShopifyGid("Product", parsed.id),
          deletedAt,
        });
      } else if (topic === "collections/create" || topic === "collections/update") {
        const collection = mapCollectionFromWebhook(parsed);
        await ctx.runMutation(internal.shopify.sync.upsertCatalogSnapshot, {
          source: "webhook",
          replaceAssociations: false,
          replaceVariants: false,
          products: [],
          collections: [collection],
        });
      } else if (topic === "collections/delete") {
        await ctx.runMutation(internal.shopify.sync.deleteCollectionByShopifyId, {
          shopifyCollectionId: toShopifyGid("Collection", parsed.id),
          deletedAt,
        });
      }

      await ctx.runMutation(internal.shopify.webhookEvents.markWebhookProcessed, {
        eventId: args.eventId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Webhook processing failed";
      await ctx.runMutation(internal.shopify.webhookEvents.markWebhookFailed, {
        eventId: args.eventId,
        error: message,
      });
    }

    return null;
  },
});
