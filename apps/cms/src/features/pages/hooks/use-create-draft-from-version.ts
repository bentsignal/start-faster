import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";
import { toast } from "@acme/ui/toaster";

import { usePageMutations } from "./use-page-mutations";

export function useCreateDraftFromVersion(pageId: Id<"pages">) {
  const navigate = useNavigate();
  const pageMutations = usePageMutations();

  return useMutation({
    ...pageMutations.createNewDraft,
    onSuccess: (draftId: Id<"pageDrafts">) => {
      void navigate({
        to: "/pages/$pageId/draft/$draftId",
        params: { pageId, draftId },
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create draft",
      );
    },
  });
}
