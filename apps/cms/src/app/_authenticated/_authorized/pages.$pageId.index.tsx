import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { EyeOff } from "lucide-react";
import { z } from "zod";

import { QuickLink } from "@acme/features/quick-link";
import { Button } from "@acme/ui/button";

import type { Viewport } from "~/features/pages/components/viewport-controls";
import { env } from "~/env";
import { OpenInNewTab } from "~/features/pages/components/open-in-new-tab";
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

function RouteComponent() {
  const { pageId, title, hasRelease, isVisible, url, viewport, setViewport } =
    usePageHub();

  if (!hasRelease) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <p className="text-muted-foreground text-lg">
          No version has been published yet
        </p>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div className="flex h-full flex-1 items-center justify-center p-6">
        <div className="bg-muted/30 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed p-8 text-center">
          <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
            <EyeOff className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-medium">This page is hidden</p>
            <p className="text-muted-foreground text-sm">
              It is not viewable on the shop and is excluded from the sitemap.
            </p>
          </div>
          <Button
            size="sm"
            render={
              <QuickLink to="/pages/$pageId/settings" params={{ pageId }} />
            }
          >
            Go to page settings
          </Button>
        </div>
      </div>
    );
  }

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

  const viewport = Route.useSearch({
    select: (search) => search.viewport,
  });

  const navigate = Route.useNavigate();
  async function setViewport(newViewport: Viewport) {
    await navigate({ search: { viewport: newViewport }, replace: true });
  }

  const url = `${env.VITE_SHOP_URL}${data.path}`;

  return { pageId, ...data, url, viewport, setViewport };
}
