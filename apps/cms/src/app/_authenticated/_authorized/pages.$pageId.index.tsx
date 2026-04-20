import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { z } from "zod";

import type { Viewport } from "~/features/pages/components/viewport-controls";
import { env } from "~/env";
import { OpenInNewTab } from "~/features/pages/components/open-in-new-tab";
import { PageHubHiddenEmpty } from "~/features/pages/components/page-hub-hidden-empty";
import { PageHubNoReleaseEmpty } from "~/features/pages/components/page-hub-no-release-empty";
import { PreviewIframe } from "~/features/pages/components/preview-iframe";
import {
  defaultViewport,
  ViewportToggle,
  viewportValidator,
} from "~/features/pages/components/viewport-controls";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/",
)({
  component: RouteComponent,
  validateSearch: z.object({
    viewport: viewportValidator.default(defaultViewport),
  }),
  loader: async ({ context }) => {
    const { pageId } = context;
    await Promise.all([
      context.queryClient.ensureQueryData(
        pageQueries.listDraftsFirstPage(pageId),
      ),
      context.queryClient.ensureQueryData(
        pageQueries.listRecentReleases(pageId),
      ),
    ]);
  },
  shouldReload: false,
});

function usePageHub() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (data) => ({
      title: data.title,
      path: data.path,
      hasRelease: data.hasRelease,
      isVisible: data.isVisible,
    }),
  });

  const viewport = Route.useSearch({ select: (s) => s.viewport });
  const navigate = Route.useNavigate();
  async function setViewport(next: Viewport) {
    await navigate({
      search: (prev) => ({ ...prev, viewport: next }),
      replace: true,
    });
  }

  const url = `${env.VITE_SHOP_URL}${data.path}`;

  return {
    hasRelease: data.hasRelease,
    isVisible: data.isVisible,
    url,
    title: data.title,
    viewport,
    setViewport,
  };
}

function RouteComponent() {
  const { hasRelease, isVisible, url, title, viewport, setViewport } =
    usePageHub();

  if (!hasRelease) return <PageHubNoReleaseEmpty />;
  if (!isVisible) return <PageHubHiddenEmpty />;

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-end gap-2 px-4 py-2">
        <OpenInNewTab url={url} />
        <ViewportToggle value={viewport} onChange={setViewport} />
      </div>
      <PreviewIframe
        url={url}
        title={`Preview of ${title}`}
        viewport={viewport}
      />
    </div>
  );
}
