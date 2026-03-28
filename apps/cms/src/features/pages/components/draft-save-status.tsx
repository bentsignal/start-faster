import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { formatRelativeTime } from "~/features/pages/lib/format-relative-time";
import { pageQueries } from "~/features/pages/lib/page-queries";
import { useIsPending } from "~/hooks/use-is-pending";

export function SaveStatus() {
  const { isSaving, updatedAt } = useSaveStatus();

  return (
    <p className="text-sidebar-foreground/40 px-2 text-xs">
      {isSaving ? "Saving..." : `Saved ${formatRelativeTime(updatedAt)}`}
    </p>
  );
}

function useSaveStatus() {
  const draftId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
    select: (ctx) => ctx.draftId,
  });
  const isSaving = useIsPending(usePageMutations().saveDraft.mutationKey);

  const { data: draft } = useSuspenseQuery({
    ...pageQueries.getDraft(draftId),
    select: (data) => ({ updatedAt: data.updatedAt }),
  });

  return { isSaving, updatedAt: draft.updatedAt };
}
