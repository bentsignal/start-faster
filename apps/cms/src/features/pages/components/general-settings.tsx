import { Input } from "@acme/ui/input";

export function GeneralSettings({
  title,
  setTitle,
  path,
  setPath,
  pathError,
  validatePathField,
  canEdit,
}: {
  title: string;
  setTitle: (value: string) => void;
  path: string;
  setPath: (value: string) => void;
  pathError: string | null;
  validatePathField: () => boolean;
  canEdit: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">General</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Core page settings that affect how the page is identified and
          accessed.
        </p>
      </div>
      <div className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="page-title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
            disabled={!canEdit}
          />
          <p className="text-muted-foreground text-xs">
            The title is displayed in the browser tab and search engine results.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="page-path" className="text-sm font-medium">
            URL Path
          </label>
          <Input
            id="page-path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            onBlur={() => validatePathField()}
            placeholder="/about"
            disabled={!canEdit}
          />
          {pathError ? (
            <p className="text-destructive text-xs">{pathError}</p>
          ) : (
            <p className="text-muted-foreground text-xs">
              URL must be unique and start with /
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
