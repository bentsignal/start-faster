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
  return (ADMIN_LEVELS as readonly number[]).includes(value);
}
