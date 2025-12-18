/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as clients from "../clients.js";
import type * as customer_mappings from "../customer_mappings.js";
import type * as http from "../http.js";
import type * as mappings from "../mappings.js";
import type * as payments from "../payments.js";
import type * as splynx_customers from "../splynx_customers.js";
import type * as syncLogs from "../syncLogs.js";
import type * as webhookLogs from "../webhookLogs.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  clients: typeof clients;
  customer_mappings: typeof customer_mappings;
  http: typeof http;
  mappings: typeof mappings;
  payments: typeof payments;
  splynx_customers: typeof splynx_customers;
  syncLogs: typeof syncLogs;
  webhookLogs: typeof webhookLogs;
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
