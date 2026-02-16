/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as catalog from "../catalog.js";
import type * as checkout from "../checkout.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as shopify_admin from "../shopify/admin.js";
import type * as shopify_checkoutUtils from "../shopify/checkoutUtils.js";
import type * as shopify_config from "../shopify/config.js";
import type * as shopify_genql_admin_index from "../shopify/genql/admin/index.js";
import type * as shopify_genql_admin_runtime_batcher from "../shopify/genql/admin/runtime/batcher.js";
import type * as shopify_genql_admin_runtime_createClient from "../shopify/genql/admin/runtime/createClient.js";
import type * as shopify_genql_admin_runtime_error from "../shopify/genql/admin/runtime/error.js";
import type * as shopify_genql_admin_runtime_fetcher from "../shopify/genql/admin/runtime/fetcher.js";
import type * as shopify_genql_admin_runtime_generateGraphqlOperation from "../shopify/genql/admin/runtime/generateGraphqlOperation.js";
import type * as shopify_genql_admin_runtime_index from "../shopify/genql/admin/runtime/index.js";
import type * as shopify_genql_admin_runtime_linkTypeMap from "../shopify/genql/admin/runtime/linkTypeMap.js";
import type * as shopify_genql_admin_runtime_typeSelection from "../shopify/genql/admin/runtime/typeSelection.js";
import type * as shopify_genql_admin_runtime_types from "../shopify/genql/admin/runtime/types.js";
import type * as shopify_genql_admin_types from "../shopify/genql/admin/types.js";
import type * as shopify_genql_storefront_index from "../shopify/genql/storefront/index.js";
import type * as shopify_genql_storefront_runtime_batcher from "../shopify/genql/storefront/runtime/batcher.js";
import type * as shopify_genql_storefront_runtime_createClient from "../shopify/genql/storefront/runtime/createClient.js";
import type * as shopify_genql_storefront_runtime_error from "../shopify/genql/storefront/runtime/error.js";
import type * as shopify_genql_storefront_runtime_fetcher from "../shopify/genql/storefront/runtime/fetcher.js";
import type * as shopify_genql_storefront_runtime_generateGraphqlOperation from "../shopify/genql/storefront/runtime/generateGraphqlOperation.js";
import type * as shopify_genql_storefront_runtime_index from "../shopify/genql/storefront/runtime/index.js";
import type * as shopify_genql_storefront_runtime_linkTypeMap from "../shopify/genql/storefront/runtime/linkTypeMap.js";
import type * as shopify_genql_storefront_runtime_typeSelection from "../shopify/genql/storefront/runtime/typeSelection.js";
import type * as shopify_genql_storefront_runtime_types from "../shopify/genql/storefront/runtime/types.js";
import type * as shopify_genql_storefront_types from "../shopify/genql/storefront/types.js";
import type * as shopify_reconcile from "../shopify/reconcile.js";
import type * as shopify_reconcileUtils from "../shopify/reconcileUtils.js";
import type * as shopify_security from "../shopify/security.js";
import type * as shopify_state from "../shopify/state.js";
import type * as shopify_storefront from "../shopify/storefront.js";
import type * as shopify_sync from "../shopify/sync.js";
import type * as shopify_types from "../shopify/types.js";
import type * as shopify_validators from "../shopify/validators.js";
import type * as shopify_webhookEvents from "../shopify/webhookEvents.js";
import type * as shopify_webhooks from "../shopify/webhooks.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  catalog: typeof catalog;
  checkout: typeof checkout;
  crons: typeof crons;
  http: typeof http;
  "shopify/admin": typeof shopify_admin;
  "shopify/checkoutUtils": typeof shopify_checkoutUtils;
  "shopify/config": typeof shopify_config;
  "shopify/genql/admin/index": typeof shopify_genql_admin_index;
  "shopify/genql/admin/runtime/batcher": typeof shopify_genql_admin_runtime_batcher;
  "shopify/genql/admin/runtime/createClient": typeof shopify_genql_admin_runtime_createClient;
  "shopify/genql/admin/runtime/error": typeof shopify_genql_admin_runtime_error;
  "shopify/genql/admin/runtime/fetcher": typeof shopify_genql_admin_runtime_fetcher;
  "shopify/genql/admin/runtime/generateGraphqlOperation": typeof shopify_genql_admin_runtime_generateGraphqlOperation;
  "shopify/genql/admin/runtime/index": typeof shopify_genql_admin_runtime_index;
  "shopify/genql/admin/runtime/linkTypeMap": typeof shopify_genql_admin_runtime_linkTypeMap;
  "shopify/genql/admin/runtime/typeSelection": typeof shopify_genql_admin_runtime_typeSelection;
  "shopify/genql/admin/runtime/types": typeof shopify_genql_admin_runtime_types;
  "shopify/genql/admin/types": typeof shopify_genql_admin_types;
  "shopify/genql/storefront/index": typeof shopify_genql_storefront_index;
  "shopify/genql/storefront/runtime/batcher": typeof shopify_genql_storefront_runtime_batcher;
  "shopify/genql/storefront/runtime/createClient": typeof shopify_genql_storefront_runtime_createClient;
  "shopify/genql/storefront/runtime/error": typeof shopify_genql_storefront_runtime_error;
  "shopify/genql/storefront/runtime/fetcher": typeof shopify_genql_storefront_runtime_fetcher;
  "shopify/genql/storefront/runtime/generateGraphqlOperation": typeof shopify_genql_storefront_runtime_generateGraphqlOperation;
  "shopify/genql/storefront/runtime/index": typeof shopify_genql_storefront_runtime_index;
  "shopify/genql/storefront/runtime/linkTypeMap": typeof shopify_genql_storefront_runtime_linkTypeMap;
  "shopify/genql/storefront/runtime/typeSelection": typeof shopify_genql_storefront_runtime_typeSelection;
  "shopify/genql/storefront/runtime/types": typeof shopify_genql_storefront_runtime_types;
  "shopify/genql/storefront/types": typeof shopify_genql_storefront_types;
  "shopify/reconcile": typeof shopify_reconcile;
  "shopify/reconcileUtils": typeof shopify_reconcileUtils;
  "shopify/security": typeof shopify_security;
  "shopify/state": typeof shopify_state;
  "shopify/storefront": typeof shopify_storefront;
  "shopify/sync": typeof shopify_sync;
  "shopify/types": typeof shopify_types;
  "shopify/validators": typeof shopify_validators;
  "shopify/webhookEvents": typeof shopify_webhookEvents;
  "shopify/webhooks": typeof shopify_webhooks;
  utils: typeof utils;
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

export declare const components: {};
