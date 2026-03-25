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
  "can-upload-files",
  "can-create-pages",
  "can-edit-pages",
] as const;
export const cmsScopeValidator = literals(...CMS_SCOPES);
export type CmsScope = Infer<typeof cmsScopeValidator>;
export const cmsScopesValidator = v.array(cmsScopeValidator);
export type CmsScopes = Infer<typeof cmsScopesValidator>;

export const STORAGE_PROVIDERS = ["convex", "r2"] as const;
export const storageProviderValidator = literals(...STORAGE_PROVIDERS);
export type StorageProvider = Infer<typeof storageProviderValidator>;

export const VERSION_STATES = ["draft", "published"] as const;
export const versionStateValidator = literals(...VERSION_STATES);
export type VersionState = Infer<typeof versionStateValidator>;
