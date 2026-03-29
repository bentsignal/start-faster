import { useState } from "react";
import { CopyPlus, Ellipsis, Trash2 } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { QuickLink } from "@acme/features/quick-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { SidebarMenuButton, SidebarMenuItem } from "@acme/ui/sidebar";

import {
  DeleteConfirmation,
  useDeleteDraft,
} from "~/features/pages/components/delete-draft-button";
import { useCreateDraftFromVersion } from "~/features/pages/hooks/use-create-draft-from-version";
import { formatRelativeTime } from "~/features/pages/lib/format-relative-time";

export function DraftItem({
  pageId,
  draft,
}: {
  pageId: Id<"pages">;
  draft: { _id: Id<"pageDrafts">; name: string; updatedAt: number };
}) {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <SidebarMenuItem
      className="group/version-item"
      data-menu-open={isMenuOpen || undefined}
    >
      <SidebarMenuButton
        size="sm"
        className="group-hover/version-item:bg-sidebar-accent group-hover/version-item:text-sidebar-accent-foreground gap-3"
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
        <TimeLabel time={draft.updatedAt} />
      </SidebarMenuButton>
      <DraftActionsMenu
        pageId={pageId}
        draftId={draft._id}
        isMenuOpen={isMenuOpen}
        setMenuOpen={setMenuOpen}
      />
    </SidebarMenuItem>
  );
}

function DraftActionsMenu({
  pageId,
  draftId,
  isMenuOpen,
  setMenuOpen,
}: {
  pageId: Id<"pages">;
  draftId: Id<"pageDrafts">;
  isMenuOpen: boolean;
  setMenuOpen: (isMenuOpen: boolean) => void;
}) {
  const { mutate: createDraft } = useCreateDraftFromVersion();
  const [confirming, setConfirming] = useState(false);
  const { deleteDraft, isPending } = useDeleteDraft({
    pageId,
    draftId,
    behavior: "delete-immediately",
  });

  function handleMenuOpenChange(nextOpen: boolean) {
    setMenuOpen(nextOpen);
    if (!nextOpen) setConfirming(false);
  }

  function handleConfirmDelete() {
    setMenuOpen(false);
    void deleteDraft();
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={handleMenuOpenChange}>
      <EllipsisTrigger />
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-64"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              createDraft({
                pageId,
                source: { kind: "draft", draftId },
              })
            }
            className="hover:cursor-pointer"
          >
            <CopyPlus className="size-3.5" />
            New draft from this version
          </DropdownMenuItem>
          {confirming ? (
            <DeleteConfirmation
              onConfirm={() => void handleConfirmDelete()}
              onCancel={() => setConfirming(false)}
              disabled={isPending}
            />
          ) : (
            <button
              type="button"
              className="text-destructive hover:bg-destructive/10 relative flex h-9 w-full cursor-default items-center gap-2.5 rounded-xl px-3 text-sm outline-hidden select-none hover:cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="size-3.5" />
              Delete draft
            </button>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const { mutate } = useCreateDraftFromVersion();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SidebarMenuItem
      className="group/version-item"
      data-menu-open={menuOpen || undefined}
    >
      <SidebarMenuButton
        size="sm"
        className="group-hover/version-item:bg-sidebar-accent group-hover/version-item:text-sidebar-accent-foreground gap-3"
      >
        <VersionBadge variant={badge} />
        <span className="truncate">{release.name}</span>
        <TimeLabel time={release.creationTime} />
      </SidebarMenuButton>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <EllipsisTrigger />
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={4}
          className="w-64"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                mutate({
                  pageId,
                  source: { kind: "release", releaseId: release._id },
                })
              }
            >
              <CopyPlus className="size-3.5" />
              New draft from this version
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function EllipsisTrigger() {
  return (
    <DropdownMenuTrigger
      render={
        <button className="text-sidebar-foreground/50 hover:text-sidebar-foreground absolute top-0 right-3 bottom-0 flex cursor-pointer items-center opacity-0 transition-colors group-hover/version-item:opacity-100 group-data-[menu-open]/version-item:opacity-100" />
      }
    >
      <Ellipsis className="size-4" />
    </DropdownMenuTrigger>
  );
}

function TimeLabel({ time }: { time: number }) {
  return (
    <span className="text-sidebar-foreground/30 ml-auto shrink-0 text-[10px] tabular-nums group-hover/version-item:invisible group-data-[menu-open]/version-item:invisible">
      {formatRelativeTime(time)}
    </span>
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
