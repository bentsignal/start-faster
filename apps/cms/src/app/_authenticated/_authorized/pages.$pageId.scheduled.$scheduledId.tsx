import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { z } from "zod";

import { toId } from "@acme/convex/ids";

import type { Viewport } from "~/features/pages/components/viewport-controls";
import { ScheduledVersionPreview } from "~/features/pages/components/version-preview-layout";
import {
  defaultViewport,
  viewportValidator,
} from "~/features/pages/components/viewport-controls";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/scheduled/$scheduledId",
)({
  component: RouteComponent,
  validateSearch: z.object({
    viewport: viewportValidator.default(defaultViewport),
  }),
  beforeLoad: ({ params }) => ({
    scheduledId: toId<"pageScheduled">(params.scheduledId),
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      pageQueries.getScheduled(context.scheduledId),
    );
  },
});

function RouteComponent() {
  const scheduledId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/scheduled/$scheduledId",
    select: (ctx) => ctx.scheduledId,
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
    <ScheduledVersionPreview
      viewport={viewport}
      setViewport={setViewport}
      scheduledId={scheduledId}
    />
  );
}
