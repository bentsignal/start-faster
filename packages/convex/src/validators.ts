import type { Infer } from "convex/values";
import { literals } from "convex-helpers/validators";
import { v } from "convex/values";

export const ADMIN_LEVELS = [0, 1, 2] as const;
export const adminLevelValidator = literals(...ADMIN_LEVELS);
export type AdminLevel = Infer<typeof adminLevelValidator>;
export const MIN_ADMIN_LEVEL = 1 satisfies AdminLevel;

export const CMS_SCOPES = [
  "can-edit-blog-posts",
  "can-create-blog-posts",
] as const;
export const cmsScopeValidator = literals(...CMS_SCOPES);
export type CmsScope = Infer<typeof cmsScopeValidator>;

export const cmsScopesValidator = v.array(cmsScopeValidator);
export type CmsScopes = Infer<typeof cmsScopesValidator>;
