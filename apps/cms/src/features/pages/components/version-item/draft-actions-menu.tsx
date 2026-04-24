import { useState } from "react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { CalendarClock, CopyPlus, Eye, Trash2 } from "lucide-react";

import type { Id } from "@acme/convex/model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@acme/ui/dropdown-menu";

import {
  DeleteConfirmation,
  useDeleteDraft,
} from "~/features/pages/components/delete-draft-button";
import { useCreateDraftFromVersion } from "~/features/pages/hooks/use-create-draft-from-version";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";
import { getScopeDeniedMessage } from "~/features/permissions/lib/cms-scope-messages";
import { EllipsisTrigger } from "./ellipsis-trigger";

interface UseDraftActionsMenuArgs {
  draftId: Id<"pageDrafts">;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onOpenSchedule: () => void;
}

function useDraftActionsMenu({
  draftId,
  isOpen,
  setOpen,
  onOpenSchedule,
}: UseDraftActionsMenuArgs) {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const navigate = useNavigate();
  const { mutate: createDraft } = useCreateDraftFromVersion();
  const [confirming, setConfirming] = useState(false);

  const { deleteDraft, isPending } = useDeleteDraft({
    pageId,
    draftId,
    behavior: "delete-immediately",
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setConfirming(false);
  }

  function handlePreview() {
    void navigate({
      to: "/pages/$pageId/draftPreview/$draftId",
      params: { pageId, draftId },
      search: (prev) => prev,
    });
  }

  function handleCreateNewDraftFromThis() {
    createDraft({ pageId, source: { kind: "draft", draftId } });
  }

  function handleSchedule() {
    setOpen(false);
    onOpenSchedule();
  }

  function handleConfirmDelete() {
    setOpen(false);
    void deleteDraft();
  }

  return {
    isOpen,
    handleOpenChange,
    confirming,
    startConfirming: () => setConfirming(true),
    cancelConfirming: () => setConfirming(false),
    isDeletePending: isPending,
    handlePreview,
    handleCreateNewDraftFromThis,
    handleSchedule,
    handleConfirmDelete,
  };
}

export function DraftActionsMenu(props: {
  draftId: Id<"pageDrafts">;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onOpenSchedule: () => void;
}) {
  const {
    isOpen,
    handleOpenChange,
    confirming,
    startConfirming,
    cancelConfirming,
    isDeletePending,
    handlePreview,
    handleCreateNewDraftFromThis,
    handleSchedule,
    handleConfirmDelete,
  } = useDraftActionsMenu(props);
  const canEdit = useHasCmsScope("can-manage-page-content");

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
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
            onClick={handlePreview}
            className="hover:cursor-pointer"
          >
            <Eye className="size-3.5" />
            Preview
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleCreateNewDraftFromThis}
            disabled={!canEdit}
            className="hover:cursor-pointer"
          >
            <CopyPlus className="size-3.5" />
            New draft from this version
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSchedule}
            disabled={!canEdit}
            className="hover:cursor-pointer"
          >
            <CalendarClock className="size-3.5" />
            Schedule for later
          </DropdownMenuItem>
          {confirming ? (
            <DeleteConfirmation
              onConfirm={handleConfirmDelete}
              onCancel={cancelConfirming}
              disabled={isDeletePending}
            />
          ) : (
            <DropdownMenuItem
              variant="destructive"
              disabled={!canEdit}
              closeOnClick={false}
              onClick={startConfirming}
              className="hover:cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              Delete draft
            </DropdownMenuItem>
          )}
          {canEdit ? null : (
            <p className="text-muted-foreground px-3 py-1.5 text-xs italic">
              {getScopeDeniedMessage("can-manage-page-content")}
            </p>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
