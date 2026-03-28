import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";

import type { Id } from "@acme/convex/model";

import { useAutosave } from "~/features/pages/hooks/use-autosave";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
)({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const draftId = params.draftId as Id<"pageDrafts">;
    return { draftId };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      pageQueries.getDraft(context.draftId),
    );
  },
});

function useDraftEditor() {
  const draftId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
    select: (ctx) => ctx.draftId,
  });

  const { data: draft } = useSuspenseQuery({
    ...pageQueries.getDraft(draftId),
    select: (data) => ({ _id: data._id, content: data.content }),
  });

  return { draft };
}

function RouteComponent() {
  const { draft } = useDraftEditor();
  const [content, setContent] = useState(draft.content);

  useAutosave({ draftId: draft._id, content });

  return (
    <div className="flex flex-1 flex-col pt-8">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing..."
        className="text-foreground placeholder:text-muted-foreground min-h-0 flex-1 resize-none border-0 bg-transparent p-6 text-base leading-relaxed outline-none"
      />
    </div>
  );
}
