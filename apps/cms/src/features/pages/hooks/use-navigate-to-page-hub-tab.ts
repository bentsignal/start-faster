import { useNavigate, useRouteContext } from "@tanstack/react-router";

import type { PageHubTab } from "~/features/pages/lib/page-version-kind";

/**
 * Navigate to the page hub (`/pages/$pageId`) with a selected tab.
 *
 * Reads `pageId` from the `/_authenticated/_authorized/pages/$pageId`
 * route context, so this hook must only be used inside routes that live
 * below that route boundary.
 */
export function useNavigateToPageHubTab() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const navigate = useNavigate();

  return async (tab: PageHubTab) => {
    await navigate({
      to: "/pages/$pageId",
      params: { pageId },
      search: { tab },
    });
  };
}
