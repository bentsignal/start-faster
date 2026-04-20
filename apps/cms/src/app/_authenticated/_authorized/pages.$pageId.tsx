import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

import { toId } from "@acme/convex/ids";

import { pageQueries } from "~/features/pages/lib/page-queries";
import { pageHubTabValidator } from "~/features/pages/lib/page-version-kind";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId",
)({
  component: Outlet,
  validateSearch: z.object({
    tab: pageHubTabValidator,
  }),
  beforeLoad: ({ params }) => {
    const pageId = toId<"pages">(params.pageId);
    return { pageId };
  },
  loader: async ({ context }) => {
    const { pageId } = context;
    await Promise.all([
      context.queryClient.ensureQueryData(pageQueries.getById(pageId)),
      context.queryClient.ensureQueryData(
        pageQueries.listScheduledFirstPage(pageId),
      ),
      context.queryClient.ensureQueryData(
        pageQueries.listReleasesFirstPage(pageId),
      ),
    ]);
  },
});
