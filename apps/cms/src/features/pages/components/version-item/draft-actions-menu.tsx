import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import {
  CalendarClock,
  Check,
  CopyPlus,
  Eye,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import type { Id } from "@acme/convex/model";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@acme/ui/dropdown-menu";
import { toast } from "@acme/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import {
  DeleteConfirmation,
  useDeleteDraft,
} from "~/features/pages/components/delete-draft-button";
import { useCreateDraftFromVersion } from "~/features/pages/hooks/use-create-draft-from-version";
import { useNavigateToPageHubTab } from "~/features/pages/hooks/use-navigate-to-page-hub-tab";
import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";
import { getScopeDeniedMessage } from "~/features/permissions/lib/cms-scope-messages";
import { useIsPending } from "~/hooks/use-is-pending";
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
  const navigateToTab = useNavigateToPageHubTab();
  const { mutate: createDraft } = useCreateDraftFromVersion();
  const [confirming, setConfirming] = useState<"delete" | "publish" | null>(
    null,
  );

  const { deleteDraft, isPending: isDeletePending } = useDeleteDraft({
    pageId,
    draftId,
    behavior: "delete-immediately",
  });

  const pageMutations = usePageMutations();
  const isPublishing = useIsPending(pageMutations.publish.mutationKey);
  const { mutate: publishMutate } = useMutation({
    ...pageMutations.publish,
    onSuccess: () => {
      setOpen(false);
      void navigateToTab("published");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setConfirming(null);
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

  function handleConfirmPublish() {
    publishMutate({ draftId });
  }

  function handleConfirmDelete() {
    setOpen(false);
    void deleteDraft();
  }

  return {
    isOpen,
    handleOpenChange,
    confirming,
    startConfirmingPublish: () => setConfirming("publish"),
    startConfirmingDelete: () => setConfirming("delete"),
    cancelConfirming: () => setConfirming(null),
    isDeletePending,
    isPublishing,
    handlePreview,
    handleCreateNewDraftFromThis,
    handleSchedule,
    handleConfirmPublish,
    handleConfirmDelete,
  };
}

export function DraftActionsMenu(props: {
  draftId: Id<"pageDrafts">;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onOpenSchedule: () => void;
}) {
  const menu = useDraftActionsMenu(props);

  return (
    <DropdownMenu open={menu.isOpen} onOpenChange={menu.handleOpenChange}>
      <EllipsisTrigger />
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-64"
      >
        <DraftActionsMenuItems menu={menu} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DraftActionsMenuItems({
  menu,
}: {
  menu: ReturnType<typeof useDraftActionsMenu>;
}) {
  const canEdit = useHasCmsScope("can-manage-page-content");

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem
        onClick={menu.handlePreview}
        className="hover:cursor-pointer"
      >
        <Eye className="size-3.5" />
        Preview
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={menu.handleCreateNewDraftFromThis}
        disabled={!canEdit}
        className="hover:cursor-pointer"
      >
        <CopyPlus className="size-3.5" />
        New draft from this version
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={menu.handleSchedule}
        disabled={!canEdit}
        className="hover:cursor-pointer"
      >
        <CalendarClock className="size-3.5" />
        Schedule for later
      </DropdownMenuItem>
      {menu.confirming === "publish" ? (
        <PublishConfirmation
          onConfirm={menu.handleConfirmPublish}
          onCancel={menu.cancelConfirming}
          disabled={menu.isPublishing}
        />
      ) : (
        <DropdownMenuItem
          disabled={!canEdit}
          closeOnClick={false}
          onClick={menu.startConfirmingPublish}
          className="hover:cursor-pointer"
        >
          <Upload className="size-3.5" />
          Publish live
        </DropdownMenuItem>
      )}
      {menu.confirming === "delete" ? (
        <DeleteConfirmation
          onConfirm={menu.handleConfirmDelete}
          onCancel={menu.cancelConfirming}
          disabled={menu.isDeletePending}
        />
      ) : (
        <DropdownMenuItem
          variant="destructive"
          disabled={!canEdit}
          closeOnClick={false}
          onClick={menu.startConfirmingDelete}
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
  );
}

function PublishConfirmation({
  onConfirm,
  onCancel,
  disabled = false,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex h-9 items-center justify-between gap-2 px-3 text-sm">
      <span className="text-muted-foreground">Publish now?</span>
      <TooltipProvider>
        <div className="ml-auto flex gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-xs"
                  variant="outline"
                  onClick={onCancel}
                  disabled={disabled}
                />
              }
            >
              <X className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Cancel</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-xs"
                  variant="default"
                  onClick={onConfirm}
                  disabled={disabled}
                />
              }
            >
              <Check className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Publish this draft</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}
