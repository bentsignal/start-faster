import { v } from "convex/values";

import { internalMutation, internalQuery } from "../_generated/server";

export const getSyncState = internalQuery({
  args: {
    key: v.string(),
  },
  returns: v.union(
    v.object({
      key: v.string(),
      cursor: v.optional(v.string()),
      lastRunAt: v.optional(v.number()),
      lastSuccessAt: v.optional(v.number()),
      metadata: v.optional(v.record(v.string(), v.string())),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const state = await ctx.db
      .query("syncState")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (!state) {
      return null;
    }
    return {
      key: state.key,
      cursor: state.cursor,
      lastRunAt: state.lastRunAt,
      lastSuccessAt: state.lastSuccessAt,
      metadata: state.metadata,
    };
  },
});

export const upsertSyncState = internalMutation({
  args: {
    key: v.string(),
    cursor: v.optional(v.string()),
    lastRunAt: v.optional(v.number()),
    lastSuccessAt: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("syncState")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        cursor: args.cursor,
        lastRunAt: args.lastRunAt,
        lastSuccessAt: args.lastSuccessAt,
        metadata: args.metadata,
      });
      return null;
    }

    await ctx.db.insert("syncState", {
      key: args.key,
      cursor: args.cursor,
      lastRunAt: args.lastRunAt,
      lastSuccessAt: args.lastSuccessAt,
      metadata: args.metadata,
    });
    return null;
  },
});
