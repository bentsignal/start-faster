import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { AuthNmutationCtx, AuthNqueryCtx } from "../custom";
import { validatePath } from "./utils";

export function pageSearchText(title: string, path: string) {
  return `${title} ${path}`.toLowerCase();
}

export async function enrichPage(ctx: AuthNqueryCtx, page: Doc<"pages">) {
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
}

export function validateTitle(rawTitle: string) {
  const title = rawTitle.trim();
  if (!title) {
    throw new ConvexError("Title is required");
  }
  return title;
}

export async function resolveUniquePath(
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

interface SeoImageInput {
  fileId: Id<"files">;
  downloadToken: string;
  fileName: string;
  alt: string;
}

interface PageUpdateArgs {
  title?: string;
  path?: string;
  isVisible?: boolean;
  seoDescription?: string;
  seoImage?: SeoImageInput | null;
}

export async function buildPageUpdates(
  ctx: AuthNmutationCtx,
  page: Doc<"pages">,
  args: PageUpdateArgs,
) {
  const core = await buildCoreUpdates(ctx, page, args);
  const seo = buildSeoUpdates(args);
  return { ...core, ...seo };
}

async function buildCoreUpdates(
  ctx: AuthNmutationCtx,
  page: Doc<"pages">,
  args: Pick<PageUpdateArgs, "title" | "path" | "isVisible">,
) {
  const nextTitle =
    args.title !== undefined ? validateTitle(args.title) : undefined;
  const nextPath =
    args.path !== undefined
      ? await resolveUniquePath(ctx, args.path, page._id)
      : undefined;

  return {
    ...(args.isVisible !== undefined && { isVisible: args.isVisible }),
    ...(nextTitle !== undefined && { title: nextTitle }),
    ...(nextPath !== undefined && { path: nextPath }),
    ...((nextTitle !== undefined || nextPath !== undefined) && {
      searchText: pageSearchText(
        nextTitle ?? page.title,
        nextPath ?? page.path,
      ),
    }),
  };
}

function buildSeoUpdates(
  args: Pick<PageUpdateArgs, "seoDescription" | "seoImage">,
) {
  return {
    ...(args.seoDescription !== undefined && {
      seoDescription: args.seoDescription,
    }),
    ...(args.seoImage !== undefined && {
      seoImage: args.seoImage ?? undefined,
    }),
  };
}
