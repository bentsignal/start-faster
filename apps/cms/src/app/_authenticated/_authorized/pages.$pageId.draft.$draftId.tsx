import { Activity, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { z } from "zod";

import type { Id } from "@acme/convex/model";

import type { EditorMode } from "~/features/pages/components/edit-preview-toggle";
import type { Viewport } from "~/features/pages/components/viewport-controls";
import { env } from "~/env";
import {
  defaultEditorMode,
  editorModeValidator,
  EditPreviewToggle,
} from "~/features/pages/components/edit-preview-toggle";
import { OpenInNewTab } from "~/features/pages/components/open-in-new-tab";
import { PreviewIframe } from "~/features/pages/components/preview-iframe";
import {
  defaultViewport,
  ViewportToggle,
  viewportValidator,
} from "~/features/pages/components/viewport-controls";
import { useAutosave } from "~/features/pages/hooks/use-autosave";
import { pageQueries } from "~/features/pages/lib/page-queries";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
)({
  component: RouteComponent,
  validateSearch: z.object({
    viewport: viewportValidator.default(defaultViewport),
    mode: editorModeValidator.default(defaultEditorMode),
  }),
  beforeLoad: ({ params }) => {
    const draftId = params.draftId as Id<"pageDrafts">;
    return { draftId };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      pageQueries.getDraft(context.draftId),
    );
  },
  shouldReload: false,
});

function RouteComponent() {
  const {
    content,
    setContent,
    mode,
    viewport,
    setMode,
    setViewport,
    previewUrl,
  } = useDraftEditor();

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-end gap-2 px-4 py-2">
        {mode === "preview" && <OpenInNewTab url={previewUrl} />}
        {mode === "preview" && (
          <ViewportToggle value={viewport} onChange={setViewport} />
        )}
        <EditPreviewToggle value={mode} onChange={setMode} />
      </div>

      <Activity mode={mode === "edit" ? "visible" : "hidden"}>
        <div className="flex flex-1 flex-col pt-8">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            className="text-foreground placeholder:text-muted-foreground min-h-0 flex-1 resize-none border-0 bg-transparent p-6 text-base leading-relaxed outline-none"
          />
        </div>
      </Activity>
      <Activity mode={mode === "preview" ? "visible" : "hidden"}>
        <PreviewIframe
          url={previewUrl}
          title={`Preview of draft`}
          viewport={viewport}
        />
      </Activity>
    </div>
  );
}

function useDraftEditor() {
  const draftId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
    select: (ctx) => ctx.draftId,
  });

  const { data: draft } = useSuspenseQuery({
    ...pageQueries.getDraft(draftId),
    select: (data) => ({ _id: data._id, content: data.content }),
  });

  const [content, setContent] = useState(draft.content);

  useAutosave({ draftId: draft._id, content });

  const { mode, viewport } = Route.useSearch({
    select: (search) => ({ mode: search.mode, viewport: search.viewport }),
  });

  const navigate = Route.useNavigate();
  async function setMode(newMode: EditorMode) {
    await navigate({ search: { mode: newMode, viewport }, replace: true });
  }
  async function setViewport(newViewport: Viewport) {
    await navigate({ search: { mode, viewport: newViewport }, replace: true });
  }

  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data: page } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (data) => ({ path: data.path }),
  });

  const previewUrl = `${env.VITE_SHOP_URL}${page.path}?draftId=${draftId}`;

  return {
    content,
    setContent,
    mode,
    viewport,
    setMode,
    setViewport,
    previewUrl,
  };
}
