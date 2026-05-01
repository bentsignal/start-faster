/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as custom from "../custom.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as ids from "../ids.js";
import type * as pages_drafts from "../pages/drafts.js";
import type * as pages_manage from "../pages/manage.js";
import type * as pages_manage_helpers from "../pages/manage_helpers.js";
import type * as pages_releases from "../pages/releases.js";
import type * as pages_scheduled from "../pages/scheduled.js";
import type * as pages_utils from "../pages/utils.js";
import type * as pages_validators from "../pages/validators.js";
import type * as privileges from "../privileges.js";
import type * as users from "../users.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  custom: typeof custom;
  files: typeof files;
  http: typeof http;
  ids: typeof ids;
  "pages/drafts": typeof pages_drafts;
  "pages/manage": typeof pages_manage;
  "pages/manage_helpers": typeof pages_manage_helpers;
  "pages/releases": typeof pages_releases;
  "pages/scheduled": typeof pages_scheduled;
  "pages/utils": typeof pages_utils;
  "pages/validators": typeof pages_validators;
  privileges: typeof privileges;
  users: typeof users;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  convexFilesControl: import("@acme/files/_generated/component.js").ComponentApi<"convexFilesControl">;
};
