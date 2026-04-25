import { ConvexError } from "convex/values";

import type { Doc } from "./_generated/dataModel";
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
  requiredScopes: CmsScope | CmsScope[],
) {
  if (typeof requiredScopes === "string") {
    if (!hasCmsScopeOrAdmin(callingUser, requiredScopes)) {
      throw new ConvexError(`Missing required scope: ${requiredScopes}`);
    }
  } else {
    for (const scope of requiredScopes) {
      if (!hasCmsScopeOrAdmin(callingUser, scope)) {
        throw new ConvexError(`Missing required scope: ${scope}`);
      }
    }
  }
}

/**
 * Admin level changes (promotions, demotions, removing admin status) are
 * reserved for super admins (level 2). Super admins can manage any other
 * admin, including other super admins, but never themselves.
 */
export function ensureCanManageAdminLevel(
  ctx: AuthNctx,
  targetUser: Doc<"users">,
) {
  if (ctx.user._id === targetUser._id) {
    throw new ConvexError("You cannot change your own admin level");
  }
  if (ctx.user.adminLevel < 2) {
    throw new ConvexError("Only super admins can change a user's admin level");
  }
  return targetUser;
}

/**
 * CMS scope changes are permitted for:
 * - Super admins (level 2), who can manage anyone (except themselves).
 * - Basic admins (level 1), who can only manage non-admin users.
 */
export function ensureCanManageCmsScopes(
  ctx: AuthNctx,
  targetUser: Doc<"users">,
) {
  if (ctx.user._id === targetUser._id) {
    throw new ConvexError("You cannot change your own permissions");
  }
  if (ctx.user.adminLevel >= 2) return targetUser;
  if (ctx.user.adminLevel >= MIN_ADMIN_LEVEL && targetUser.adminLevel === 0) {
    return targetUser;
  }
  throw new ConvexError(
    "You don't have permission to manage this user's CMS scopes",
  );
}
