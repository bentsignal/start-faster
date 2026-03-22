import type { CustomCtx } from "convex-helpers/server/customFunctions";
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

export const checkAuthN = async (ctx: QueryCtx | MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_user_id", (q) =>
      q.eq("workosUserId", identity.subject),
    )
    .unique();
  if (!user) {
    throw new ConvexError("User not found");
  }
  return { identity, user };
};

export const authNmutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    return await checkAuthN(ctx);
  }),
);

export const authNquery = customQuery(
  query,
  customCtx(async (ctx) => {
    return await checkAuthN(ctx);
  }),
);

type AuthNqueryCtx = CustomCtx<typeof authNquery>;
type AuthNmutationCtx = CustomCtx<typeof authNmutation>;
type AuthNctx = AuthNqueryCtx | AuthNmutationCtx;

export type { AuthNmutationCtx, AuthNqueryCtx, AuthNctx };
