import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { z } from "zod";

import { toId } from "@acme/convex/ids";

import type { Viewport } from "~/features/pages/components/viewport-controls";
import { DraftVersionPreview } from "~/features/pages/components/version-preview-layout";
import {
  defaultViewport,
  viewportValidator,
} from "~/features/pages/components/viewport-controls";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/draftPreview/$draftId",
)({
  component: RouteComponent,
  validateSearch: z.object({
    viewport: viewportValidator.default(defaultViewport),
  }),
  beforeLoad: ({ params }) => ({
    draftId: toId<"pageDrafts">(params.draftId),
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      pageQueries.getDraft(context.draftId),
    );
  },
});

function RouteComponent() {
  const draftId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/draftPreview/$draftId",
    select: (ctx) => ctx.draftId,
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
    <DraftVersionPreview
      viewport={viewport}
      setViewport={setViewport}
      draftId={draftId}
    />
  );
}
