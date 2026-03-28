import type { Id } from "@acme/convex/model";
import { QuickLink } from "@acme/features/quick-link";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@acme/ui/context-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@acme/ui/sidebar";

import { useCreateDraftFromVersion } from "~/features/pages/hooks/use-create-draft-from-version";
import { formatRelativeTime } from "~/features/pages/lib/format-relative-time";

export function DraftItem({
  pageId,
  draft,
}: {
  pageId: Id<"pages">;
  draft: { _id: Id<"pageDrafts">; name: string; updatedAt: number };
}) {
  const { mutate } = useCreateDraftFromVersion(pageId);

  return (
    <ContextMenu>
      <ContextMenuTrigger render={<SidebarMenuItem />}>
        <SidebarMenuButton
          size="sm"
          className="gap-3"
          render={
            <QuickLink
              to="/pages/$pageId/draft/$draftId"
              params={{ pageId, draftId: draft._id }}
              activeProps={{ "data-active": "" }}
            />
          }
        >
          <VersionBadge variant="draft" />
          <span className="truncate">{draft.name}</span>
          <span className="text-sidebar-foreground/30 ml-auto shrink-0 text-[10px] tabular-nums">
            {formatRelativeTime(draft.updatedAt)}
          </span>
        </SidebarMenuButton>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() =>
            mutate({
              pageId,
              source: { kind: "draft", draftId: draft._id },
            })
          }
        >
          New draft from this version
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function ReleaseItem({
  pageId,
  release,
}: {
  pageId: Id<"pages">;
  release: {
    _id: Id<"pageReleases">;
    name: string;
    creationTime: number;
    isLatest: boolean;
  };
}) {
  const badge = release.isLatest ? "live" : "previous";
  const { mutate } = useCreateDraftFromVersion(pageId);

  return (
    <ContextMenu>
      <ContextMenuTrigger render={<SidebarMenuItem />}>
        <SidebarMenuButton size="sm" className="gap-3">
          <VersionBadge variant={badge} />
          <span className="truncate">{release.name}</span>
          <span className="text-sidebar-foreground/30 ml-auto shrink-0 text-[10px] tabular-nums">
            {formatRelativeTime(release.creationTime)}
          </span>
        </SidebarMenuButton>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={() =>
            mutate({
              pageId,
              source: { kind: "release", releaseId: release._id },
            })
          }
        >
          New draft from this version
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function VersionBadge({ variant }: { variant: "draft" | "live" | "previous" }) {
  switch (variant) {
    case "live":
      return (
        <span className="bg-chart-2/15 text-chart-2 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
          Live
        </span>
      );
    case "previous":
      return (
        <span className="bg-sidebar-accent text-sidebar-foreground/50 inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
          Previous
        </span>
      );
    case "draft":
      return (
        <span className="bg-muted text-muted-foreground inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
          Draft
        </span>
      );
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
}
