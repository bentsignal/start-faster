import type { AdminLevel } from "@acme/convex/types";
import { ADMIN_LEVELS } from "@acme/convex/types";

const ADMIN_LEVEL_LABELS = {
  0: "No Admin Access",
  1: "Basic Admin",
  2: "Super Admin",
} as const satisfies Record<AdminLevel, string>;

export function getAdminLevelLabel(level: AdminLevel) {
  return ADMIN_LEVEL_LABELS[level];
}

export function isAdminLevel(value: number): value is AdminLevel {
  return ADMIN_LEVELS.some((level) => level === value);
}

/**
 * Mirrors the backend rule: only super admins (level 2) may change admin
 * levels, and nobody may change their own. Used to gate the admin-level UI.
 */
export function canManageAdminLevel(args: {
  currentUserId: string;
  currentUserAdminLevel: AdminLevel;
  targetUserId: string;
}) {
  if (args.currentUserId === args.targetUserId) return false;
  return args.currentUserAdminLevel >= 2;
}

/**
 * Mirrors the backend rule: super admins can manage scopes for anyone else,
 * basic admins can only manage scopes for non-admin users.
 */
export function canManageCmsScopes(args: {
  currentUserId: string;
  currentUserAdminLevel: AdminLevel;
  targetUserId: string;
  targetUserAdminLevel: AdminLevel;
}) {
  if (args.currentUserId === args.targetUserId) return false;
  if (args.currentUserAdminLevel >= 2) return true;
  return args.currentUserAdminLevel >= 1 && args.targetUserAdminLevel === 0;
}
