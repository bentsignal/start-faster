import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { z } from "zod";

import { toId } from "@acme/convex/ids";

import type { Viewport } from "~/features/pages/components/viewport-controls";
import { ReleaseVersionPreview } from "~/features/pages/components/version-preview-layout";
import {
  defaultViewport,
  viewportValidator,
} from "~/features/pages/components/viewport-controls";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/release/$releaseId",
)({
  component: RouteComponent,
  validateSearch: z.object({
    viewport: viewportValidator.default(defaultViewport),
  }),
  beforeLoad: ({ params }) => ({
    releaseId: toId<"pageReleases">(params.releaseId),
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      pageQueries.getRelease(context.releaseId),
    );
  },
});

function RouteComponent() {
  const releaseId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/release/$releaseId",
    select: (ctx) => ctx.releaseId,
  });
  const viewport = Route.useSearch({ select: (s) => s.viewport });
  const navigate = Route.useNavigate();
  async function setViewport(next: Viewport) {
    await navigate({
      search: (prev) => ({ ...prev, viewport: next }),
      replace: true,
    });
  }
  return (
    <ReleaseVersionPreview
      viewport={viewport}
      setViewport={setViewport}
      releaseId={releaseId}
    />
  );
}
