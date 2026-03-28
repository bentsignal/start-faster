import { createFileRoute, Outlet } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";

import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId",
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const pageId = params.pageId as Id<"pages">;
    return { pageId };
  },
  loader: async ({ context }) => {
    const { pageId } = context;
    await Promise.all([
      context.queryClient.ensureQueryData(pageQueries.getById(pageId)),
    ]);
  },
});

function RouteComponent() {
  return <Outlet />;
}
