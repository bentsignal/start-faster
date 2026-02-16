import { v } from "convex/values";

import { internal } from "../_generated/api";
import { internalMutation, internalQuery } from "../_generated/server";

export const enqueueWebhookEvent = internalMutation({
  args: {
    deliveryId: v.string(),
    topic: v.string(),
    shopDomain: v.string(),
    triggeredAt: v.optional(v.string()),
    payload: v.string(),
    payloadHash: v.string(),
  },
  returns: v.object({
    accepted: v.boolean(),
    eventId: v.union(v.id("webhookEvents"), v.null()),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("webhookEvents")
      .withIndex("by_delivery_id", (q) => q.eq("deliveryId", args.deliveryId))
      .unique();

    if (existing) {
      return { accepted: false, eventId: existing._id };
    }

    const eventId = await ctx.db.insert("webhookEvents", {
      deliveryId: args.deliveryId,
      topic: args.topic,
      shopDomain: args.shopDomain,
      triggeredAt: args.triggeredAt,
      payload: args.payload,
      payloadHash: args.payloadHash,
      status: "queued",
      processedAt: undefined,
      error: undefined,
    });

    await ctx.scheduler.runAfter(0, internal.shopify.webhooks.processQueuedWebhook, {
      eventId,
    });

    return { accepted: true, eventId };
  },
});

export const getWebhookEvent = internalQuery({
  args: {
    eventId: v.id("webhookEvents"),
  },
  returns: v.union(
    v.object({
      _id: v.id("webhookEvents"),
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
    }),
    v.null(),
  ),
  handler: async (ctx, args) => await ctx.db.get(args.eventId),
});

export const markWebhookProcessed = internalMutation({
  args: {
    eventId: v.id("webhookEvents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: "processed",
      processedAt: Date.now(),
      error: undefined,
    });
    return null;
  },
});

export const markWebhookFailed = internalMutation({
  args: {
    eventId: v.id("webhookEvents"),
    error: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.eventId, {
      status: "failed",
      processedAt: Date.now(),
      error: args.error,
    });
    return null;
  },
});

export const cleanupProcessedWebhookEvents = internalMutation({
  args: {
    olderThanMs: v.number(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.olderThanMs;
    const processed = await ctx.db
      .query("webhookEvents")
      .withIndex("by_processed_at", (q) => q.lt("processedAt", cutoff))
      .collect();
    for (const event of processed) {
      await ctx.db.delete(event._id);
    }
    return processed.length;
  },
});
