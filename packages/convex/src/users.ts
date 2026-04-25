import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { AuthNctx } from "./custom";
import { mutation } from "./_generated/server";
import { authNmutation, authNquery } from "./custom";
import {
  ensureCanManageAdminLevel,
  ensureCanManageCmsScopes,
  ensureMinimumAdminLevel,
} from "./privileges";
import {
  adminLevelValidator,
  cmsScopesValidator,
  MIN_ADMIN_LEVEL,
} from "./validators";

function toSearchText(args: { name: string; email: string }) {
  return `${args.name} ${args.email}`.toLowerCase();
}

async function getUserByIdHelper(ctx: AuthNctx, id: Id<"users">) {
  const user = await ctx.db.get("users", id);
  if (!user) throw new ConvexError("User not found");
  return user;
}

export const getCurrentUser = authNquery({
  handler: (ctx) => ctx.user,
});

export const ensureUserExists = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthenticated");
    }
    const possibleUser = await ctx.db
      .query("users")
      .withIndex("by_workos_user_id", (q) =>
        q.eq("workosUserId", identity.subject),
      )
      .unique();
    const nameFromClaims = identity.name;
    const emailFromClaims = identity.email;

    if (!possibleUser) {
      const nextName = nameFromClaims ?? "";
      const nextEmail = emailFromClaims ?? "";
      const nextSearchText = toSearchText({
        name: nextName,
        email: nextEmail,
      });
      await ctx.db.insert("users", {
        workosUserId: identity.subject,
        name: nextName,
        email: nextEmail,
        adminLevel: 0,
        cmsScopes: [],
        searchText: nextSearchText,
      });
      return false;
    }

    const nextName = nameFromClaims ?? possibleUser.name;
    const nextEmail = emailFromClaims ?? possibleUser.email;
    const nextSearchText = toSearchText({
      name: nextName,
      email: nextEmail,
    });
    if (
      possibleUser.name !== nextName ||
      possibleUser.email !== nextEmail ||
      possibleUser.searchText !== nextSearchText
    ) {
      await ctx.db.patch(possibleUser._id, {
        name: nextName,
        email: nextEmail,
        searchText: nextSearchText,
      });
    }
    return true;
  },
});

export const searchUsersPaginated = authNquery({
  args: {
    searchTerm: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    ensureMinimumAdminLevel(ctx.user, MIN_ADMIN_LEVEL);

    const normalizedSearchTerm = args.searchTerm?.trim().toLowerCase();
    if (!normalizedSearchTerm) {
      return await ctx.db
        .query("users")
        .withIndex("by_email")
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("users")
      .withSearchIndex("search_text", (q) =>
        q.search("searchText", normalizedSearchTerm),
      )
      .paginate(args.paginationOpts);
  },
});

export const getUserById = authNquery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    ensureMinimumAdminLevel(ctx.user, MIN_ADMIN_LEVEL);

    const userId = ctx.db.normalizeId("users", args.userId);
    if (userId === null) {
      throw new ConvexError("User not found");
    }

    const user = await ctx.db.get(userId);
    if (user === null) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

export const updateUserAdminLevel = authNmutation({
  args: {
    userId: v.id("users"),
    adminLevel: adminLevelValidator,
  },
  handler: async (ctx, args) => {
    const target = await getUserByIdHelper(ctx, args.userId);
    ensureCanManageAdminLevel(ctx, target);
    await ctx.db.patch(target._id, { adminLevel: args.adminLevel });
  },
});

export const updateUserCmsScopes = authNmutation({
  args: {
    userId: v.id("users"),
    cmsScopes: cmsScopesValidator,
  },
  handler: async (ctx, args) => {
    const target = await getUserByIdHelper(ctx, args.userId);
    ensureCanManageCmsScopes(ctx, target);
    await ctx.db.patch(target._id, { cmsScopes: args.cmsScopes });
  },
});

export const revokeAllPermissions = authNmutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const target = await getUserByIdHelper(ctx, args.userId);
    if (target.adminLevel === 0) {
      ensureCanManageCmsScopes(ctx, target);
    } else {
      ensureCanManageAdminLevel(ctx, target);
    }
    await ctx.db.patch(args.userId, { adminLevel: 0, cmsScopes: [] });
  },
});
