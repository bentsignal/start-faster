import { ConvexError, v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import type { AuthNmutationCtx } from "../custom";
import { query } from "../_generated/server";
import { authNmutation, authNquery } from "../custom";
import { ensureCmsScopeOrAdmin } from "../privileges";
import { validatePath } from "./utils";

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
      isVisible: true,
      createdByUserId: ctx.user._id,
    });

    const draftId = await ctx.db.insert("pageDrafts", {
      pageId,
      name: "Untitled Draft",
      blocks: [],
      createdByUserId: ctx.user._id,
      updatedAt: Date.now(),
    });

    return { pageId, draftId };
  },
});

function validateTitle(rawTitle: string) {
  const title = rawTitle.trim();
  if (!title) {
    throw new ConvexError("Title is required");
  }
  return title;
}

async function resolveUniquePath(
  ctx: AuthNmutationCtx,
  rawPath: string,
  pageId: Id<"pages">,
) {
  const pathResult = validatePath(rawPath);
  if (pathResult.status === "invalid") {
    throw new ConvexError(pathResult.error);
  }
  const existing = await ctx.db
    .query("pages")
    .withIndex("by_path", (q) => q.eq("path", pathResult.path))
    .first();
  if (existing && existing._id !== pageId) {
    throw new ConvexError("A page with this path already exists");
  }
  return pathResult.path;
}

export const updateMetadata = authNmutation({
  args: {
    pageId: v.id("pages"),
    title: v.optional(v.string()),
    path: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-manage-page-metadata");

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new ConvexError("Page not found");
    }

    const updates = {
      ...(args.isVisible !== undefined && { isVisible: args.isVisible }),
      ...(args.title !== undefined && { title: validateTitle(args.title) }),
      ...(args.path !== undefined && {
        path: await resolveUniquePath(ctx, args.path, args.pageId),
      }),
    };

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.pageId, updates);
    }
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

    if (draft.blocks.length === 0) {
      throw new ConvexError("Cannot publish a draft with no blocks");
    }

    await ctx.db.insert("pageReleases", {
      pageId: draft.pageId,
      name: draft.name,
      blocks: draft.blocks,
      publishedByUserId: ctx.user._id,
    });

    // Delete the draft after publishing
    await ctx.db.delete(args.draftId);
  },
});

export const list = authNquery({
  args: {},
  handler: async (ctx) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const pages = await ctx.db.query("pages").order("desc").collect();

    return await Promise.all(pages.map((page) => enrichPage(ctx, page)));
  },
});

export const backfillSearchText = internalMutation({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db.query("pages").collect();
    let updated = 0;
    for (const page of pages) {
      if (page.searchText !== undefined) continue;
      await ctx.db.patch(page._id, {
        searchText: pageSearchText(page.title, page.path),
      });
      updated++;
    }
    return { scanned: pages.length, updated };
  },
});

export const listPaginated = authNquery({
  args: {
    searchTerm: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-view-pages");

    const normalized = args.searchTerm?.trim().toLowerCase();

    const result = normalized
      ? await ctx.db
          .query("pages")
          .withSearchIndex("search_text", (q) =>
            q.search("searchText", normalized),
          )
          .paginate(args.paginationOpts)
      : await ctx.db.query("pages").order("desc").paginate(args.paginationOpts);

    const enriched = await Promise.all(
      result.page.map((page) => enrichPage(ctx, page)),
    );

    return { ...result, page: enriched };
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

export const listForSitemap = query({
  args: {},
  handler: async (ctx) => {
    const pages = await ctx.db.query("pages").collect();

    const visiblePages = pages.filter((page) => page.isVisible);

    const entries = await Promise.all(
      visiblePages.map(async (page) => {
        const latestRelease = await ctx.db
          .query("pageReleases")
          .withIndex("by_pageId", (q) => q.eq("pageId", page._id))
          .order("desc")
          .first();

        if (!latestRelease) {
          return null;
        }

        return {
          path: page.path,
          updatedAt: latestRelease._creationTime,
        };
      }),
    );

    return entries.filter((entry) => entry !== null);
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

    if (!page.isVisible) {
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
      blocks: latestRelease.blocks,
    };
  },
});
