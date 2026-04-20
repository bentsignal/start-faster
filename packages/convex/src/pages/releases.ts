import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { query } from "../_generated/server";
import { authNquery } from "../custom";
import { ensureCmsScopeOrAdmin } from "../privileges";

export const get = authNquery({
  args: {
    releaseId: v.id("pageReleases"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const release = await ctx.db.get(args.releaseId);
    if (!release) {
      throw new ConvexError("Release not found");
    }
    return release;
  },
});

export const getPreview = query({
  args: {
    releaseId: v.id("pageReleases"),
  },
  handler: async (ctx, args) => {
    const release = await ctx.db.get(args.releaseId);
    if (!release) {
      return null;
    }

    const page = await ctx.db.get(release.pageId);
    if (!page) {
      return null;
    }

    return {
      title: page.title,
      blocks: release.blocks,
    };
  },
});

export const listRecent = authNquery({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    return await ctx.db
      .query("pageReleases")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .order("desc")
      .take(3);
  },
});

export const list = authNquery({
  args: {
    pageId: v.id("pages"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    return await ctx.db
      .query("pageReleases")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const listRecentlyPublished = authNquery({
  args: {
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const releases = await ctx.db
      .query("pageReleases")
      .order("desc")
      .take(args.limit);

    return await Promise.all(
      releases.map(async (release) => {
        const page = await ctx.db.get(release.pageId);
        return {
          _id: release._id,
          pageId: release.pageId,
          name: release.name,
          publishedAt: release._creationTime,
          pageTitle: page?.title ?? "Unknown page",
          pagePath: page?.path ?? "",
        };
      }),
    );
  },
});
