import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { internal } from "../_generated/api";
import { internalMutation, query } from "../_generated/server";
import { authNmutation, authNquery } from "../custom";
import { ensureCmsScopeOrAdmin } from "../privileges";

export const schedule = authNmutation({
  args: {
    draftId: v.id("pageDrafts"),
    scheduledAt: v.number(),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    if (args.scheduledAt <= Date.now()) {
      throw new ConvexError("Scheduled time must be in the future");
    }

    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new ConvexError("Draft not found");
    }

    if (draft.blocks.length === 0) {
      throw new ConvexError("Cannot publish a draft with no blocks");
    }

    // Insert the immutable snapshot first so we have an id to pass to the
    // scheduled callback, then patch the resulting function id back.
    const scheduledId = await ctx.db.insert("pageScheduled", {
      pageId: draft.pageId,
      name: draft.name,
      blocks: draft.blocks,
      scheduledByUserId: ctx.user._id,
      scheduledAt: args.scheduledAt,
    });

    const scheduledFunctionId = await ctx.scheduler.runAt(
      args.scheduledAt,
      internal.pages.scheduled.runScheduledPublish,
      { scheduledId },
    );

    await ctx.db.patch(scheduledId, { scheduledFunctionId });

    await ctx.db.delete(args.draftId);

    return { scheduledId };
  },
});

export const reschedule = authNmutation({
  args: {
    scheduledId: v.id("pageScheduled"),
    scheduledAt: v.number(),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    if (args.scheduledAt <= Date.now()) {
      throw new ConvexError("Scheduled time must be in the future");
    }

    const row = await ctx.db.get(args.scheduledId);
    if (!row) {
      throw new ConvexError("Scheduled version not found");
    }

    if (row.scheduledFunctionId) {
      await ctx.scheduler.cancel(row.scheduledFunctionId);
    }

    const scheduledFunctionId = await ctx.scheduler.runAt(
      args.scheduledAt,
      internal.pages.scheduled.runScheduledPublish,
      { scheduledId: args.scheduledId },
    );

    await ctx.db.patch(args.scheduledId, {
      scheduledAt: args.scheduledAt,
      scheduledFunctionId,
    });
  },
});

export const revertToDraft = authNmutation({
  args: {
    scheduledId: v.id("pageScheduled"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    const row = await ctx.db.get(args.scheduledId);
    if (!row) {
      throw new ConvexError("Scheduled version not found");
    }

    if (row.scheduledFunctionId) {
      await ctx.scheduler.cancel(row.scheduledFunctionId);
    }

    const draftId = await ctx.db.insert("pageDrafts", {
      pageId: row.pageId,
      name: row.name,
      blocks: row.blocks,
      createdByUserId: ctx.user._id,
      updatedAt: Date.now(),
      lastScheduledAt: row.scheduledAt,
    });

    await ctx.db.delete(args.scheduledId);

    return { draftId };
  },
});

export const runScheduledPublish = internalMutation({
  args: {
    scheduledId: v.id("pageScheduled"),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.scheduledId);
    if (!row) {
      // Already canceled or reverted — nothing to do.
      return;
    }

    await ctx.db.insert("pageReleases", {
      pageId: row.pageId,
      name: row.name,
      blocks: row.blocks,
      publishedByUserId: row.scheduledByUserId,
    });

    await ctx.db.delete(args.scheduledId);
  },
});

export const listForPage = authNquery({
  args: {
    pageId: v.id("pages"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    return await ctx.db
      .query("pageScheduled")
      .withIndex("by_pageId_and_scheduledAt", (q) =>
        q.eq("pageId", args.pageId),
      )
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const get = authNquery({
  args: {
    scheduledId: v.id("pageScheduled"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const row = await ctx.db.get(args.scheduledId);
    if (!row) {
      throw new ConvexError("Scheduled version not found");
    }
    return row;
  },
});

export const getPreview = query({
  args: {
    scheduledId: v.id("pageScheduled"),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.scheduledId);
    if (!row) {
      return null;
    }

    const page = await ctx.db.get(row.pageId);
    if (!page) {
      return null;
    }

    return {
      title: page.title,
      blocks: row.blocks,
    };
  },
});

export const listUpcoming = authNquery({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const rows = await ctx.db
      .query("pageScheduled")
      .withIndex("by_scheduledAt")
      .order("asc")
      .take(args.limit);

    return await Promise.all(
      rows.map(async (row) => {
        const page = await ctx.db.get(row.pageId);
        return {
          _id: row._id,
          pageId: row.pageId,
          name: row.name,
          scheduledAt: row.scheduledAt,
          pageTitle: page?.title ?? "Unknown page",
          pagePath: page?.path ?? "",
        };
      }),
    );
  },
});
