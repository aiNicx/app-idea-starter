/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentConfigurations from "../agentConfigurations.js";
import type * as agents from "../agents.js";
import type * as auth from "../auth.js";
import type * as migrations from "../migrations.js";
import type * as permissions from "../permissions.js";
import type * as projects from "../projects.js";
import type * as workflows from "../workflows.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  agentConfigurations: typeof agentConfigurations;
  agents: typeof agents;
  auth: typeof auth;
  migrations: typeof migrations;
  permissions: typeof permissions;
  projects: typeof projects;
  workflows: typeof workflows;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
