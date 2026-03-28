import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { query } from "./_generated/server";
import { authNmutation, authNquery } from "./custom";
import { validatePath } from "./page_utils";
import { ensureCmsScopeOrAdmin } from "./privileges";

export const create = authNmutation({
  args: {
    title: v.string(),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-create-new-pages");

    const title = args.title.trim();
    if (!title) {
      throw new ConvexError("Title is required");
    }

    const pathResult = validatePath(args.path);
    if (pathResult.status === "invalid") {
      throw new ConvexError(pathResult.error);
    }

    // Check path uniqueness
    const existing = await ctx.db
      .query("pages")
      .withIndex("by_path", (q) => q.eq("path", pathResult.path))
      .first();
    if (existing) {
      throw new ConvexError("A page with this path already exists");
    }

    const pageId = await ctx.db.insert("pages", {
      title,
      path: pathResult.path,
      createdByUserId: ctx.user._id,
    });

    const draftId = await ctx.db.insert("pageDrafts", {
      pageId,
      name: "Untitled Draft",
      content: "",
      createdByUserId: ctx.user._id,
      updatedAt: Date.now(),
    });

    return { pageId, draftId };
  },
});

export const saveDraft = authNmutation({
  args: {
    draftId: v.id("pageDrafts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new ConvexError("Draft not found");
    }

    await ctx.db.patch(args.draftId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const createNewDraft = authNmutation({
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
    let content = "";

    if (args.source) {
      switch (args.source.kind) {
        case "release": {
          const release = await ctx.db.get(args.source.releaseId);
          if (release) {
            name = `Copy of ${release.name}`;
            content = release.content;
          }
          break;
        }
        case "draft": {
          const draft = await ctx.db.get(args.source.draftId);
          if (draft) {
            name = `Copy of ${draft.name}`;
            content = draft.content;
          }
          break;
        }
      }
    }

    const draftId = await ctx.db.insert("pageDrafts", {
      pageId: args.pageId,
      name,
      content,
      createdByUserId: ctx.user._id,
      updatedAt: Date.now(),
    });

    return draftId;
  },
});

export const publish = authNmutation({
  args: {
    draftId: v.id("pageDrafts"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-content");

    const draft = await ctx.db.get(args.draftId);
    if (!draft) {
      throw new ConvexError("Draft not found");
    }

    if (!draft.content.trim()) {
      throw new ConvexError("Cannot publish a draft with empty content");
    }

    await ctx.db.insert("pageReleases", {
      pageId: draft.pageId,
      name: draft.name,
      content: draft.content,
      publishedByUserId: ctx.user._id,
    });

    // Delete the draft after publishing
    await ctx.db.delete(args.draftId);
  },
});

export const updatePageMetadata = authNmutation({
  args: {
    pageId: v.id("pages"),
    title: v.optional(v.string()),
    path: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-metadata");

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new ConvexError("Page not found");
    }

    const updates: { title?: string; path?: string } = {};

    if (args.title !== undefined) {
      const title = args.title.trim();
      if (!title) {
        throw new ConvexError("Title is required");
      }
      updates.title = title;
    }

    if (args.path !== undefined) {
      const pathResult = validatePath(args.path);
      if (pathResult.status === "invalid") {
        throw new ConvexError(pathResult.error);
      }

      // Check path uniqueness (exclude current page)
      const existing = await ctx.db
        .query("pages")
        .withIndex("by_path", (q) => q.eq("path", pathResult.path))
        .first();
      if (existing && existing._id !== args.pageId) {
        throw new ConvexError("A page with this path already exists");
      }

      updates.path = pathResult.path;
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.pageId, updates);
    }
  },
});

export const renameDraft = authNmutation({
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

export const list = authNquery({
  args: {},
  handler: async (ctx) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const pages = await ctx.db.query("pages").order("desc").collect();

    return await Promise.all(
      pages.map(async (page) => {
        const drafts = await ctx.db
          .query("pageDrafts")
          .withIndex("by_pageId", (q) => q.eq("pageId", page._id))
          .collect();

        const latestRelease = await ctx.db
          .query("pageReleases")
          .withIndex("by_pageId", (q) => q.eq("pageId", page._id))
          .order("desc")
          .first();

        const createdByUser = await ctx.db.get(page.createdByUserId);

        return {
          ...page,
          hasRelease: latestRelease !== null,
          hasDraft: drafts.length > 0,
          draftCount: drafts.length,
          createdBy: createdByUser
            ? { _id: createdByUser._id, name: createdByUser.name }
            : null,
        };
      }),
    );
  },
});

export const getById = authNquery({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new ConvexError("Page not found");
    }

    const latestRelease = await ctx.db
      .query("pageReleases")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .order("desc")
      .first();

    const createdByUser = await ctx.db.get(page.createdByUserId);

    return {
      ...page,
      hasRelease: latestRelease !== null,
      createdBy: createdByUser
        ? { _id: createdByUser._id, name: createdByUser.name }
        : null,
    };
  },
});

export const getDraft = authNquery({
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

export const listDrafts = authNquery({
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

export const listRecentReleases = authNquery({
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

export const getDraftPreview = query({
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
      content: draft.content,
    };
  },
});

export const getByPath = query({
  args: {
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("pages")
      .withIndex("by_path", (q) => q.eq("path", args.path))
      .first();

    if (!page) {
      return null;
    }

    const latestRelease = await ctx.db
      .query("pageReleases")
      .withIndex("by_pageId", (q) => q.eq("pageId", page._id))
      .order("desc")
      .first();

    if (!latestRelease) {
      return null;
    }

    return {
      title: page.title,
      path: page.path,
      content: latestRelease.content,
    };
  },
});
