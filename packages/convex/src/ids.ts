import type { Id, TableNames } from "./_generated/dataModel";

/**
 * Centralized branded id cast. Use this instead of scattering
 * `as Id<"...">` with eslint-disable comments across the codebase.
 *
 * The TS skill bans `as` casts outside of `as const`; this helper is
 * the single escape hatch for converting a raw string param (e.g. from
 * a route) into a Convex branded id.
 */
export function toId<TTable extends TableNames>(raw: string) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- centralized branded id cast
  return raw as Id<TTable>;
}
