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
  return { identity };
};

export const checkAuthR = async (ctx: QueryCtx | MutationCtx) => {
  const { identity } = await checkAuthN(ctx);
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_user_id", (q) =>
      q.eq("workosUserId", identity.subject),
    )
    .unique();
  if (!user) {
    throw new ConvexError("Current user record not found");
  }
  if (user.accessLevel === "unauthorized") {
    throw new ConvexError("Unauthorized");
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

export const authRmutation = customMutation(
  authNmutation,
  customCtx(async (ctx) => {
    return await checkAuthR(ctx);
  }),
);

export const authRquery = customQuery(
  authNquery,
  customCtx(async (ctx) => {
    return await checkAuthR(ctx);
  }),
);

type AuthNqueryCtx = CustomCtx<typeof authNquery>;
type AuthNmutationCtx = CustomCtx<typeof authNmutation>;
type AuthNctx = AuthNqueryCtx | AuthNmutationCtx;

type AuthRqueryCtx = CustomCtx<typeof authRquery>;
type AuthRmutationCtx = CustomCtx<typeof authRmutation>;
type AuthRctx = AuthRqueryCtx | AuthRmutationCtx;

export type {
  AuthNmutationCtx,
  AuthNqueryCtx,
  AuthRmutationCtx,
  AuthRqueryCtx,
  AuthNctx,
  AuthRctx,
};
