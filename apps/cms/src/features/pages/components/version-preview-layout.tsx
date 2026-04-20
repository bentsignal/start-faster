import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";

import type { Viewport } from "~/features/pages/components/viewport-controls";
import type { PageVersionKind } from "~/features/pages/lib/page-version-kind";
import { OpenInNewTab } from "~/features/pages/components/open-in-new-tab";
import { PreviewIframe } from "~/features/pages/components/preview-iframe";
import { ViewportToggle } from "~/features/pages/components/viewport-controls";
import { buildPreviewUrl } from "~/features/pages/lib/build-preview-url";
import { formatAbsoluteDateTime } from "~/features/pages/lib/format-relative-time";
import { pageQueries } from "~/features/pages/lib/page-queries";

const TIME_LABEL = {
  draft: "Updated",
  release: "Published",
  scheduled: "Scheduled for",
} as const satisfies Record<PageVersionKind, string>;

interface VersionEntity {
  name: string;
  timestamp: number;
}

function usePagePath(pageId: Id<"pages">) {
  const { data } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (d) => d.path,
  });
  return data;
}

function usePageIdFromRoute() {
  return useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
}

function useDraftPreviewEntity(draftId: Id<"pageDrafts">) {
  const { data } = useSuspenseQuery({
    ...pageQueries.getDraft(draftId),
    select: (d) => ({ name: d.name, timestamp: d.updatedAt }),
  });
  return data;
}

function useReleasePreviewEntity(releaseId: Id<"pageReleases">) {
  const { data } = useSuspenseQuery({
    ...pageQueries.getRelease(releaseId),
    select: (d) => ({ name: d.name, timestamp: d._creationTime }),
  });
  return data;
}

function useScheduledPreviewEntity(scheduledId: Id<"pageScheduled">) {
  const { data } = useSuspenseQuery({
    ...pageQueries.getScheduled(scheduledId),
    select: (d) => ({ name: d.name, timestamp: d.scheduledAt }),
  });
  return data;
}

interface LayoutShellProps {
  kind: PageVersionKind;
  viewport: Viewport;
  setViewport: (next: Viewport) => void | Promise<void>;
  entity: VersionEntity;
  path: string;
  id: string;
}

function VersionPreviewShell({
  kind,
  viewport,
  setViewport,
  entity,
  path,
  id,
}: LayoutShellProps) {
  const url = buildPreviewUrl({ path, mode: kind, id });
  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-end gap-3 px-4 py-2">
        <div className="flex min-w-0 flex-col items-end">
          <span className="truncate text-sm font-medium">{entity.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {TIME_LABEL[kind]} {formatAbsoluteDateTime(entity.timestamp)}
          </span>
        </div>
        <OpenInNewTab url={url} />
        <ViewportToggle value={viewport} onChange={setViewport} />
      </div>
      <PreviewIframe
        url={url}
        title={`Preview of ${entity.name}`}
        viewport={viewport}
      />
    </div>
  );
}

interface CommonPreviewProps {
  viewport: Viewport;
  setViewport: (next: Viewport) => void | Promise<void>;
}

export function DraftVersionPreview({
  viewport,
  setViewport,
  draftId,
}: CommonPreviewProps & { draftId: Id<"pageDrafts"> }) {
  const pageId = usePageIdFromRoute();
  const path = usePagePath(pageId);
  const entity = useDraftPreviewEntity(draftId);
  return (
    <VersionPreviewShell
      kind="draft"
      viewport={viewport}
      setViewport={setViewport}
      entity={entity}
      path={path}
      id={draftId}
    />
  );
}

export function ReleaseVersionPreview({
  viewport,
  setViewport,
  releaseId,
}: CommonPreviewProps & { releaseId: Id<"pageReleases"> }) {
  const pageId = usePageIdFromRoute();
  const path = usePagePath(pageId);
  const entity = useReleasePreviewEntity(releaseId);
  return (
    <VersionPreviewShell
      kind="release"
      viewport={viewport}
      setViewport={setViewport}
      entity={entity}
      path={path}
      id={releaseId}
    />
  );
}

export function ScheduledVersionPreview({
  viewport,
  setViewport,
  scheduledId,
}: CommonPreviewProps & { scheduledId: Id<"pageScheduled"> }) {
  const pageId = usePageIdFromRoute();
  const path = usePagePath(pageId);
  const entity = useScheduledPreviewEntity(scheduledId);
  return (
    <VersionPreviewShell
      kind="scheduled"
      viewport={viewport}
      setViewport={setViewport}
      entity={entity}
      path={path}
      id={scheduledId}
    />
  );
}
