import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import type { Block } from "./validators";
import { query } from "../_generated/server";
import { authNmutation, authNquery } from "../custom";
import { ensureCmsScopeOrAdmin } from "../privileges";
import { blockValidator } from "./validators";

export const save = authNmutation({
  args: {
    draftId: v.id("pageDrafts"),
    blocks: v.array(blockValidator),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new ConvexError("Draft not found");
    }

    await ctx.db.patch(args.draftId, {
      blocks: args.blocks,
      updatedAt: Date.now(),
    });
  },
});

export const createNew = authNmutation({
  args: {
    pageId: v.id("pages"),
    source: v.optional(
      v.union(
        v.object({
          kind: v.literal("release"),
          releaseId: v.id("pageReleases"),
        }),
        v.object({ kind: v.literal("draft"), draftId: v.id("pageDrafts") }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new ConvexError("Page not found");
    }

    let name = "Untitled Draft";
    // eslint-disable-next-line no-restricted-syntax -- need explicit type for the mutable variable that gets assigned in multiple branches
    let blocks: Block[] = [];

    if (args.source) {
      switch (args.source.kind) {
        case "release": {
          const release = await ctx.db.get(args.source.releaseId);
          if (release) {
            name = `Copy of ${release.name}`;
            blocks = release.blocks;
          }
          break;
        }
        case "draft": {
          const draft = await ctx.db.get(args.source.draftId);
          if (draft) {
            name = `Copy of ${draft.name}`;
            blocks = draft.blocks;
          }
          break;
        }
      }
    }

    const draftId = await ctx.db.insert("pageDrafts", {
      pageId: args.pageId,
      name,
      blocks,
      createdByUserId: ctx.user._id,
      updatedAt: Date.now(),
    });

    return draftId;
  },
});

export const rename = authNmutation({
  args: {
    draftId: v.id("pageDrafts"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new ConvexError("Draft not found");
    }

    const name = args.name.trim();
    if (!name) {
      throw new ConvexError("Name is required");
    }

    await ctx.db.patch(args.draftId, { name });
  },
});

export const deleteDraft = authNmutation({
  args: {
    draftId: v.id("pageDrafts"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new ConvexError("Draft not found");
    }

    await ctx.db.delete(args.draftId);
  },
});

export const get = authNquery({
  args: {
    draftId: v.id("pageDrafts"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new ConvexError("Draft not found");
    }
    return draft;
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
      .query("pageDrafts")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getPreview = query({
  args: {
    draftId: v.id("pageDrafts"),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      return null;
    }

    const page = await ctx.db.get(draft.pageId);
    if (!page) {
      return null;
    }

    return {
      title: page.title,
      blocks: draft.blocks,
    };
  },
});
