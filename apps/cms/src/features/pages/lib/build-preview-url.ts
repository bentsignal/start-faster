import type { PageVersionKind } from "~/features/pages/lib/page-version-kind";
import { env } from "~/env";

const QUERY_PARAM = {
  draft: "draftId",
  release: "releaseId",
  scheduled: "scheduledId",
} as const satisfies Record<PageVersionKind, string>;

/**
 * Pure helper that builds the shop preview URL for a given page path +
 * version entity id. Matches the string format used by the three preview
 * routes prior to the shared-layout refactor.
 */
export function buildPreviewUrl(args: {
  path: string;
  mode: PageVersionKind;
  id: string;
}) {
  return `${env.VITE_SHOP_URL}${args.path}?${QUERY_PARAM[args.mode]}=${args.id}`;
}
