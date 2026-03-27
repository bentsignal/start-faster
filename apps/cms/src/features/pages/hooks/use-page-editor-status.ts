import { useIsPending } from "~/hooks/use-is-pending";
import { usePageMutations } from "./use-page-mutations";

export function usePageEditorStatus() {
  const pageMutations = usePageMutations();
  const isSaving = useIsPending(pageMutations.saveDraft.mutationKey);
  const isPublishing = useIsPending(pageMutations.publish.mutationKey);

  if (isSaving) return "saving" as const;
  if (isPublishing) return "publishing" as const;
  return "idle" as const;
}
