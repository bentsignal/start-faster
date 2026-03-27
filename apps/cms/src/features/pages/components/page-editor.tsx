import { useActiveVersion } from "~/features/pages/hooks/use-active-version";
import { PageFormStore } from "~/features/pages/stores/page-form-store";
import { EditorActions } from "./editor-actions";
import { EditorFields } from "./editor-fields";
import { EditorHeader } from "./editor-header";

export function PageEditor() {
  const activeVersion = useActiveVersion();

  if (!activeVersion) {
    return (
      <p className="text-muted-foreground text-sm">
        No versions found. Something went wrong.
      </p>
    );
  }

  return (
    <PageFormStore
      key={activeVersion.versionId}
      initial={{
        title: activeVersion.title,
        path: activeVersion.path,
        content: activeVersion.content,
      }}
    >
      <div className="space-y-6">
        <EditorHeader />
        <EditorFields />
        <EditorActions />
      </div>
    </PageFormStore>
  );
}
