import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { Trash2, X } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";

export function DeleteDraftButton() {
  const [confirming, setConfirming] = useState(false);

  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const draftId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
    select: (ctx) => ctx.draftId,
  });
  const { deleteDraft, isPending } = useDeleteDraft({
    pageId,
    draftId,
    behavior: "navigate-before-delete",
  });

  if (confirming) {
    return (
      <DeleteConfirmation
        onConfirm={deleteDraft}
        onCancel={() => setConfirming(false)}
        disabled={isPending}
      />
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 w-full justify-start gap-2"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="size-3.5 shrink-0" />
      Delete draft
    </Button>
  );
}

export function DeleteConfirmation({
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
      <span className="text-muted-foreground">Are you sure?</span>
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
            <TooltipContent>Don&apos;t delete this draft</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-xs"
                  className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-none"
                  onClick={onConfirm}
                  disabled={disabled}
                />
              }
            >
              <Trash2 className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Delete this draft</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  );
}

export function useDeleteDraft({
  pageId,
  draftId,
  behavior,
}: {
  pageId: Id<"pages">;
  draftId: Id<"pageDrafts">;
  behavior: "navigate-before-delete" | "delete-immediately";
}) {
  const navigate = useNavigate();
  const pageMutations = usePageMutations();

  const { mutateAsync, isPending } = useMutation({
    ...pageMutations.deleteDraft,
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete draft",
      );
    },
  });

  async function deleteDraft() {
    if (behavior === "navigate-before-delete") {
      await navigate({ to: "/pages/$pageId", params: { pageId } });
    }

    await mutateAsync({ draftId });
  }

  return { deleteDraft, isPending };
}
