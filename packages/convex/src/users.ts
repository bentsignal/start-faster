import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { authNmutation, authNquery, authRmutation, authRquery } from "./custom";

function toSearchText(args: { name: string; email: string }) {
  return `${args.name} ${args.email}`.toLowerCase();
}

function assertAuthorizedAdmin(accessLevel: "authorized" | "unauthorized") {
  if (accessLevel !== "authorized") {
    throw new ConvexError("Unauthorized");
  }
}

export const getCurrentUser = authNquery({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos_user_id", (q) =>
        q.eq("workosUserId", ctx.identity.subject),
      )
      .unique();
  },
});

export const ensureUserExists = authNmutation({
  handler: async (ctx) => {
    const possibleUser = await ctx.db
      .query("users")
      .withIndex("by_workos_user_id", (q) =>
        q.eq("workosUserId", ctx.identity.subject),
      )
      .unique();
    const nameFromClaims = ctx.identity.name;
    const emailFromClaims = ctx.identity.email;

    if (possibleUser) {
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
    }

    const nextName = nameFromClaims ?? "";
    const nextEmail = emailFromClaims ?? "";
    const nextSearchText = toSearchText({
      name: nextName,
      email: nextEmail,
    });
    await ctx.db.insert("users", {
      workosUserId: ctx.identity.subject,
      name: nextName,
      email: nextEmail,
      accessLevel: "unauthorized",
      searchText: nextSearchText,
    });
    return false;
  },
});

export const searchUsersPaginated = authRquery({
  args: {
    searchTerm: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    assertAuthorizedAdmin(ctx.user.accessLevel);

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

export const getUserById = authRquery({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    assertAuthorizedAdmin(ctx.user.accessLevel);

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

export const updateUserAccessLevel = authRmutation({
  args: {
    userId: v.id("users"),
    accessLevel: v.union(v.literal("authorized"), v.literal("unauthorized")),
  },
  handler: async (ctx, args) => {
    assertAuthorizedAdmin(ctx.user.accessLevel);
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, {
      accessLevel: args.accessLevel,
    });
  },
});
