import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { Check, FilePlus, Loader, Save } from "lucide-react";

import { validatePublishInput } from "@acme/convex/pages";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

import { useActiveVersion } from "~/features/pages/hooks/use-active-version";
import { usePageEditorStatus } from "~/features/pages/hooks/use-page-editor-status";
import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { toOptional } from "~/features/pages/lib/utils";
import { usePageFormStore } from "~/features/pages/stores/page-form-store";
import { useIsPending } from "~/hooks/use-is-pending";

export function EditorActions() {
  const activeVersion = useActiveVersion();
  if (!activeVersion) return null;

  switch (activeVersion.state) {
    case "draft":
      return <DraftActions />;
    case "published":
      return <CreateDraftButton />;
    default: {
      const _exhaustive: never = activeVersion.state;
      throw new Error(`Unhandled state: ${String(_exhaustive)}`);
    }
  }
}

function DraftActions() {
  const { onSave, onPublish, editorStatus } = useDraftActions();

  switch (editorStatus) {
    case "saving":
      return (
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled>
            <Loader className="size-4 animate-spin" /> Saving...
          </Button>
          <Button disabled>
            <Check className="size-4" /> Publish
          </Button>
        </div>
      );
    case "publishing":
      return (
        <div className="flex items-center gap-3">
          <Button variant="outline" disabled>
            <Save className="size-4" /> Save Draft
          </Button>
          <Button disabled>
            <Loader className="size-4 animate-spin" /> Publishing...
          </Button>
        </div>
      );
    case "idle":
      return (
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onSave}>
            <Save className="size-4" /> Save Draft
          </Button>
          <Button onClick={onPublish}>
            <Check className="size-4" /> Publish
          </Button>
        </div>
      );
    default: {
      const _exhaustive: never = editorStatus;
      return _exhaustive;
    }
  }
}

function useDraftActions() {
  const activeVersion = useActiveVersion();
  const title = usePageFormStore((s) => s.title);
  const path = usePageFormStore((s) => s.path);
  const content = usePageFormStore((s) => s.content);
  const pageMutations = usePageMutations();
  const editorStatus = usePageEditorStatus();

  const { mutateAsync: saveDraft } = useMutation({
    ...pageMutations.saveDraft,
    onSuccess: () => {
      toast.success("Draft saved.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to save draft",
      );
    },
  });

  const { mutate: publishPage } = useMutation({
    ...pageMutations.publish,
    onSuccess: () => {
      toast.success("Page published!");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    },
  });

  function onSave() {
    if (!activeVersion) return;
    void saveDraft({
      versionId: activeVersion.versionId,
      title: toOptional(title),
      path: toOptional(path),
      content: toOptional(content),
    });
  }

  function onPublish() {
    if (!activeVersion) return;
    const optionalFields = {
      title: toOptional(title),
      path: toOptional(path),
      content: toOptional(content),
    };
    const result = validatePublishInput(optionalFields);
    if (result.status === "invalid") {
      toast.error(result.error);
      return;
    }
    void saveDraft({
      versionId: activeVersion.versionId,
      ...optionalFields,
    }).then(() => {
      publishPage({ versionId: activeVersion.versionId });
    });
  }

  return { onSave, onPublish, editorStatus };
}

function CreateDraftButton() {
  const { createDraft, isCreating } = useCreateDraft();

  return (
    <Button onClick={createDraft} disabled={isCreating}>
      {isCreating ? (
        <>
          <Loader className="size-4 animate-spin" /> Creating...
        </>
      ) : (
        <>
          <FilePlus className="size-4" /> Create Draft from This Version
        </>
      )}
    </Button>
  );
}

function useCreateDraft() {
  const navigate = useNavigate();
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const activeVersion = useActiveVersion();
  const pageMutations = usePageMutations();
  const isCreating = useIsPending(pageMutations.createNewDraft.mutationKey);

  const { mutate } = useMutation({
    ...pageMutations.createNewDraft,
    onSuccess: (versionId) => {
      void navigate({
        to: "/pages/$pageId",
        params: { pageId },
        search: { versionId },
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create draft",
      );
    },
  });

  return {
    createDraft: () =>
      mutate({ pageId, fromVersionId: activeVersion?.versionId ?? undefined }),
    isCreating,
  };
}
