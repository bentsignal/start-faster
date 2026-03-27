import { Input } from "@acme/ui/input";
import { cn } from "@acme/ui/utils";

import { useActiveVersion } from "~/features/pages/hooks/use-active-version";
import { usePageEditorStatus } from "~/features/pages/hooks/use-page-editor-status";
import { usePageFormStore } from "~/features/pages/stores/page-form-store";

const textareaClassName =
  "bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full min-w-0 rounded-2xl border px-3 py-2 text-base transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-y";

export function EditorFields() {
  const { disabled } = useEditorFieldsState();
  const title = usePageFormStore((s) => s.title);
  const path = usePageFormStore((s) => s.path);
  const content = usePageFormStore((s) => s.content);
  const setTitle = usePageFormStore((s) => s.setTitle);
  const setPath = usePageFormStore((s) => s.setPath);
  const setContent = usePageFormStore((s) => s.setContent);

  return (
    <div className="space-y-4">
      <Field label="Title" htmlFor="page-title">
        <Input
          id="page-title"
          placeholder="About Us"
          value={title}
          disabled={disabled}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>
      <Field
        label="URL path"
        htmlFor="page-path"
        hint="Must start with /. Example: /about-us"
      >
        <Input
          id="page-path"
          placeholder="/about-us"
          value={path}
          disabled={disabled}
          onChange={(e) => setPath(e.target.value)}
        />
      </Field>
      <Field label="Content" htmlFor="page-content">
        <textarea
          id="page-content"
          rows={12}
          placeholder="Write your page content here..."
          value={content}
          disabled={disabled}
          onChange={(e) => setContent(e.target.value)}
          className={cn(textareaClassName)}
        />
      </Field>
    </div>
  );
}

function useEditorFieldsState() {
  const activeVersion = useActiveVersion();
  const editorStatus = usePageEditorStatus();
  const disabled = editorStatus !== "idle" || activeVersion?.state !== "draft";
  return { disabled };
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm leading-none font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}
