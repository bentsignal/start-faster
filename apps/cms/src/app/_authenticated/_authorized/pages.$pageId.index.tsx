import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";

import type { Viewport } from "~/features/pages/components/viewport-controls";
import { env } from "~/env";
import {
  VIEWPORT_OPTIONS,
  ViewportToggle,
} from "~/features/pages/components/viewport-controls";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/",
)({
  component: RouteComponent,
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
});

function RouteComponent() {
  const { title, path, hasRelease } = usePageHub();
  const [viewport, setViewport] = useState<Viewport>("desktop");

  if (!hasRelease) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <p className="text-muted-foreground text-lg">
          No version has been published yet
        </p>
      </div>
    );
  }

  const activeOption = VIEWPORT_OPTIONS.find((o) => o.value === viewport);

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-end px-4 py-2">
        <ViewportToggle value={viewport} onChange={setViewport} />
      </div>
      <div className="flex min-h-0 flex-1 items-start justify-center">
        <iframe
          src={`${env.VITE_SHOP_URL}${path}`}
          title={`Preview of ${title}`}
          className={viewport !== "desktop" ? "border" : undefined}
          style={{
            width: activeOption?.width ?? "100%",
            height: activeOption?.height ?? "100%",
            maxHeight: "100%",
          }}
        />
      </div>
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
    }),
  });

  return data;
}
