import { ConvexError, v } from "convex/values";

import { query } from "./_generated/server";
import { authNmutation, authNquery } from "./custom";
import { ensureCmsScopeOrAdmin } from "./privileges";

const RESERVED_PATHS = [
  "/",
  "/shop",
  "/collections",
  "/search",
  "/privacy-policy",
  "/terms-of-service",
  "/_auth",
  "/_authenticated",
] as const;

export function validatePublishInput(input: {
  title: string | undefined;
  path: string | undefined;
  content: string | undefined;
}) {
  const title = input.title?.trim();
  const path = input.path?.trim();
  const content = input.content?.trim();

  if (!title || !path || !content) {
    return {
      status: "invalid" as const,
      error: "All fields are required to publish.",
    };
  }

  if (!path.startsWith("/")) {
    return { status: "invalid" as const, error: "Path must start with /" };
  }

  if (path !== "/" && path.endsWith("/")) {
    return { status: "invalid" as const, error: "Path must not end with /" };
  }

  for (const reserved of RESERVED_PATHS) {
    if (path === reserved || path.startsWith(reserved + "/")) {
      return {
        status: "invalid" as const,
        error: `Path ${reserved} is reserved`,
      };
    }
  }

  return { status: "valid" as const, title, path, content };
}

export const create = authNmutation({
  args: {},
  handler: async (ctx) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-create-pages");

    const pageId = await ctx.db.insert("pages", {
      createdByUserId: ctx.user._id,
      createdAt: Date.now(),
    });

    const versionId = await ctx.db.insert("pageVersions", {
      pageId,
      state: "draft",
      createdByUserId: ctx.user._id,
      updatedAt: Date.now(),
    });

    return { pageId, versionId };
  },
});

export const saveDraft = authNmutation({
  args: {
    versionId: v.id("pageVersions"),
    title: v.optional(v.string()),
    path: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-edit-pages");

    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new ConvexError("Version not found");
    }
    if (version.state !== "draft") {
      throw new ConvexError("Can only edit draft versions");
    }

    await ctx.db.patch(args.versionId, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.path !== undefined && { path: args.path }),
      ...(args.content !== undefined && { content: args.content }),
      updatedAt: Date.now(),
    });
  },
});

export const publish = authNmutation({
  args: {
    versionId: v.id("pageVersions"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-edit-pages");

    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new ConvexError("Version not found");
    }
    if (version.state !== "draft") {
      throw new ConvexError("This version is already published");
    }

    const result = validatePublishInput({
      title: version.title,
      path: version.path,
      content: version.content,
    });
    if (result.status === "invalid") {
      throw new ConvexError(result.error);
    }

    const { title, path, content } = result;

    // Check path uniqueness: no other page should have a published version with this path
    const existingPublished = await ctx.db
      .query("pageVersions")
      .withIndex("by_path_and_state", (q) =>
        q.eq("path", path).eq("state", "published"),
      )
      .collect();

    const conflict = existingPublished.find((v) => v.pageId !== version.pageId);
    if (conflict) {
      throw new ConvexError(
        "Another page already has a published version with this path",
      );
    }

    await ctx.db.replace(args.versionId, {
      pageId: version.pageId,
      state: "published",
      title,
      path,
      content,
      createdByUserId: version.createdByUserId,
      updatedAt: Date.now(),
    });
  },
});

export const createNewDraft = authNmutation({
  args: {
    pageId: v.id("pages"),
    fromVersionId: v.optional(v.id("pageVersions")),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-edit-pages");

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new ConvexError("Page not found");
    }

    // Pre-fill from the specified version, or fall back to latest published
    const sourceVersion = args.fromVersionId
      ? await ctx.db.get(args.fromVersionId)
      : await ctx.db
          .query("pageVersions")
          .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
          .order("desc")
          .filter((q) => q.eq(q.field("state"), "published"))
          .first();

    const versionId = await ctx.db.insert("pageVersions", {
      pageId: args.pageId,
      state: "draft",
      title: sourceVersion?.title,
      path: sourceVersion?.path,
      content: sourceVersion?.content,
      createdByUserId: ctx.user._id,
      updatedAt: Date.now(),
    });

    return versionId;
  },
});

export const list = authNquery({
  args: {},
  handler: async (ctx) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-create-pages");

    const pages = await ctx.db.query("pages").order("desc").collect();

    return await Promise.all(
      pages.map(async (page) => {
        const versions = await ctx.db
          .query("pageVersions")
          .withIndex("by_pageId", (q) => q.eq("pageId", page._id))
          .order("desc")
          .collect();

        // Find the latest published version, or fall back to the latest version
        const latestPublished = versions.find((v) => v.state === "published");
        const displayVersion =
          latestPublished ?? (versions.length > 0 ? versions[0] : undefined);

        const createdByUser = await ctx.db.get(page.createdByUserId);

        return {
          ...page,
          title: displayVersion?.title ?? "Untitled",
          path: displayVersion?.path,
          state: latestPublished ? ("published" as const) : ("draft" as const),
          hasPublished: latestPublished !== undefined,
          hasDraft: versions.some((v) => v.state === "draft"),
          versionCount: versions.length,
          updatedAt: displayVersion?.updatedAt ?? page.createdAt,
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
    ensureCmsScopeOrAdmin(ctx.user, "can-create-pages");

    const page = await ctx.db.get(args.pageId);
    if (!page) {
      throw new ConvexError("Page not found");
    }

    const versions = await ctx.db
      .query("pageVersions")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .order("desc")
      .collect();

    const createdByUser = await ctx.db.get(page.createdByUserId);

    return {
      ...page,
      versions,
      createdBy: createdByUser
        ? { _id: createdByUser._id, name: createdByUser.name }
        : null,
    };
  },
});

export const listVersions = authNquery({
  args: {
    pageId: v.id("pages"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-create-pages");

    const versions = await ctx.db
      .query("pageVersions")
      .withIndex("by_pageId", (q) => q.eq("pageId", args.pageId))
      .order("desc")
      .collect();

    return await Promise.all(
      versions.map(async (version) => {
        const user = await ctx.db.get(version.createdByUserId);
        return {
          ...version,
          createdBy: user ? { _id: user._id, name: user.name } : null,
        };
      }),
    );
  },
});

export const getVersion = authNquery({
  args: {
    versionId: v.id("pageVersions"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-create-pages");

    const version = await ctx.db.get(args.versionId);
    if (!version) {
      throw new ConvexError("Version not found");
    }
    return version;
  },
});

export const getByPath = query({
  args: {
    path: v.string(),
  },
  handler: async (ctx, args) => {
    // Index includes updatedAt, so desc order gives us the most recently published
    return await ctx.db
      .query("pageVersions")
      .withIndex("by_path_and_state", (q) =>
        q.eq("path", args.path).eq("state", "published"),
      )
      .order("desc")
      .first();
  },
});
