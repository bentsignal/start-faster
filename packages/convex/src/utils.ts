import type { CustomCtx } from "convex-helpers/server/customFunctions";
import {
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

export const checkAuth = async (ctx: QueryCtx | MutationCtx) => {
  const user = await ctx.auth.getUserIdentity();
  if (!user) {
    throw new ConvexError("Unauthenticated");
  }
  return { user };
};

export const authedMutation = customMutation(
  mutation,
  customCtx(async (ctx) => {
    const { user } = await checkAuth(ctx);
    return { user };
  }),
);

export const authedQuery = customQuery(
  query,
  customCtx(async (ctx) => {
    const { user } = await checkAuth(ctx);
    return { user };
  }),
);

type AuthedQueryCtx = CustomCtx<typeof authedQuery>;
type AuthedMutationCtx = CustomCtx<typeof authedMutation>;

export type { AuthedQueryCtx, AuthedMutationCtx };
