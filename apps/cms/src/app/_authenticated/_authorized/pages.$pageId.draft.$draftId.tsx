import { Activity, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { z } from "zod";

import { toId } from "@acme/convex/ids";

import type { EditorMode } from "~/features/pages/components/edit-preview-toggle";
import type { Viewport } from "~/features/pages/components/viewport-controls";
import { env } from "~/env";
import { DraftEditPanel } from "~/features/pages/components/draft-edit-panel";
import { DraftPreviewPanel } from "~/features/pages/components/draft-preview-panel";
import {
  defaultEditorMode,
  editorModeValidator,
  EditPreviewToggle,
} from "~/features/pages/components/edit-preview-toggle";
import { OpenInNewTab } from "~/features/pages/components/open-in-new-tab";
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
  component: DraftEditor,
  validateSearch: z.object({
    viewport: viewportValidator.default(defaultViewport),
    mode: editorModeValidator.default(defaultEditorMode),
  }),
  beforeLoad: ({ params }) => {
    const draftId = toId<"pageDrafts">(params.draftId);
    return { draftId };
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      pageQueries.getDraft(context.draftId),
    );
  },
  shouldReload: false,
});

function DraftEditor() {
  const {
    blocks,
    setBlocks,
    mode,
    setMode,
    viewport,
    setViewport,
    previewUrl,
  } = useDraftEditor();

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-end gap-2 px-4 py-2">
        {mode === "preview" && (
          <>
            <OpenInNewTab url={previewUrl} />
            <ViewportToggle value={viewport} onChange={setViewport} />
          </>
        )}
        <EditPreviewToggle value={mode} onChange={setMode} />
      </div>
      <Activity mode={mode === "edit" ? "visible" : "hidden"}>
        <DraftEditPanel blocks={blocks} setBlocks={setBlocks} />
      </Activity>
      <Activity mode={mode === "preview" ? "visible" : "hidden"}>
        <DraftPreviewPanel url={previewUrl} viewport={viewport} />
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
    select: (data) => ({ _id: data._id, blocks: data.blocks }),
  });

  const [blocks, setBlocks] = useState(draft.blocks);

  useAutosave({ draftId: draft._id, blocks });

  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data: page } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (data) => ({ path: data.path }),
  });

  const previewUrl = `${env.VITE_SHOP_URL}${page.path}?draftId=${draftId}`;

  const mode = Route.useSearch({ select: (s) => s.mode });
  const viewport = Route.useSearch({ select: (s) => s.viewport });

  const navigate = Route.useNavigate();
  async function setMode(next: EditorMode) {
    await navigate({
      search: (prev) => ({ ...prev, mode: next }),
      replace: true,
    });
  }
  async function setViewport(next: Viewport) {
    await navigate({
      search: (prev) => ({ ...prev, viewport: next }),
      replace: true,
    });
  }

  return {
    blocks,
    setBlocks,
    mode,
    setMode,
    viewport,
    setViewport,
    previewUrl,
  };
}
