import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { CalendarClock, Eye, X } from "lucide-react";

import type { Id } from "@acme/convex/model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@acme/ui/dropdown-menu";
import { toast } from "@acme/ui/toaster";

import { useNavigateToPageHubTab } from "~/features/pages/hooks/use-navigate-to-page-hub-tab";
import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";
import { getScopeDeniedMessage } from "~/features/permissions/lib/cms-scope-messages";
import { EllipsisTrigger } from "./ellipsis-trigger";

function useScheduledActionsMenu({
  scheduledId,
  setOpen,
  onOpenReschedule,
}: {
  scheduledId: Id<"pageScheduled">;
  setOpen: (open: boolean) => void;
  onOpenReschedule: () => void;
}) {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const navigate = useNavigate();
  const navigateToTab = useNavigateToPageHubTab();
  const pageMutations = usePageMutations();
  const { mutate: revert } = useMutation({
    ...pageMutations.revertScheduledToDraft,
    onSuccess: () => {
      void navigateToTab("drafts");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to revert to draft",
      );
    },
  });

  function handlePreview() {
    void navigate({
      to: "/pages/$pageId/scheduled/$scheduledId",
      params: { pageId, scheduledId },
      search: (prev) => prev,
    });
  }

  function handleReschedule() {
    setOpen(false);
    onOpenReschedule();
  }

  function handleRevert() {
    setOpen(false);
    revert({ scheduledId });
  }

  return { handlePreview, handleReschedule, handleRevert };
}

export function ScheduledActionsMenu({
  scheduledId,
  isOpen,
  setOpen,
  onOpenReschedule,
}: {
  scheduledId: Id<"pageScheduled">;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onOpenReschedule: () => void;
}) {
  const { handlePreview, handleReschedule, handleRevert } =
    useScheduledActionsMenu({ scheduledId, setOpen, onOpenReschedule });
  const canEdit = useHasCmsScope("can-manage-page-content");

  return (
    <DropdownMenu open={isOpen} onOpenChange={setOpen}>
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
            onClick={handleReschedule}
            disabled={!canEdit}
            className="hover:cursor-pointer"
          >
            <CalendarClock className="size-3.5" />
            Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleRevert}
            disabled={!canEdit}
            className="hover:cursor-pointer"
          >
            <X className="size-3.5" />
            Cancel
          </DropdownMenuItem>
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
