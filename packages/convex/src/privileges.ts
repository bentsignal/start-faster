import { ConvexError } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { AuthNctx } from "./custom";
import type { AdminLevel, CmsScope } from "./validators";
import { MIN_ADMIN_LEVEL } from "./validators";

export function hasCmsAccess(user: Doc<"users">) {
  return user.adminLevel >= MIN_ADMIN_LEVEL || user.cmsScopes.length > 0;
}

export function hasCmsScopeOrAdmin(user: Doc<"users">, scope: CmsScope) {
  return user.adminLevel >= MIN_ADMIN_LEVEL || user.cmsScopes.includes(scope);
}

export function ensureMinimumAdminLevel(
  callingUser: Doc<"users">,
  requiredLevel: AdminLevel,
) {
  if (callingUser.adminLevel < requiredLevel) {
    throw new ConvexError("Insufficient admin level");
  }
}

export function ensureCmsScopes(
  callingUser: Doc<"users">,
  requiredScopes: CmsScope[],
) {
  for (const scope of requiredScopes) {
    if (!callingUser.cmsScopes.includes(scope)) {
      throw new ConvexError(`Missing required scope: ${scope}`);
    }
  }
}

export function ensureCmsScopeOrAdmin(
  callingUser: Doc<"users">,
  requiredScope: CmsScope,
) {
  if (!hasCmsScopeOrAdmin(callingUser, requiredScope)) {
    throw new ConvexError(`Missing required scope: ${requiredScope}`);
  }
}

export async function ensureCallerIsHigherThanTarget(
  ctx: AuthNctx,
  targetUserId: Id<"users">,
) {
  const targetUser = await ctx.db.get(targetUserId);
  if (!targetUser) throw new ConvexError("Target user not found");
  if (ctx.user.adminLevel <= targetUser.adminLevel) {
    throw new ConvexError(
      "You can only manage users with a lower admin level than yours",
    );
  }
  return targetUser;
}
