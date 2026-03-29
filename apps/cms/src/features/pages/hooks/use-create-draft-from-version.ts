import { useMutation } from "@tanstack/react-query";

import { toast } from "@acme/ui/toaster";

import { usePageMutations } from "./use-page-mutations";

export function useCreateDraftFromVersion() {
  const pageMutations = usePageMutations();

  return useMutation({
    ...pageMutations.createNewDraft,
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create draft",
      );
    },
  });
}
