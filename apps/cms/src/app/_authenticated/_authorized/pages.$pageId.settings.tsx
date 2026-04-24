import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";

import { validatePath } from "@acme/convex/page-utils";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toaster";

import { PageVisibilityToggle } from "~/features/pages/components/page-visibility-toggle";
import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { pageQueries } from "~/features/pages/lib/page-queries";
import { PermissionNoticeBanner } from "~/features/permissions/components/permission-notice";
import { RestrictedTooltip } from "~/features/permissions/components/restricted-tooltip";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";
import { useIsPending } from "~/hooks/use-is-pending";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/settings",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const form = usePageSettings();
  const canEdit = useHasCmsScope("can-manage-page-metadata");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-10 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Page Settings</h1>
      {canEdit ? null : (
        <PermissionNoticeBanner scope="can-manage-page-metadata" />
      )}
      <PageVisibilityToggle pageId={form.pageId} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="page-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="page-title"
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
              placeholder="Page title"
              disabled={!canEdit}
            />
            <p className="text-muted-foreground text-xs">
              The title is displayed in the browser tab and search engine
              results.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="page-path" className="text-sm font-medium">
              URL Path
            </label>
            <Input
              id="page-path"
              value={form.path}
              onChange={(e) => form.setPath(e.target.value)}
              onBlur={() => form.validatePathField()}
              placeholder="/about"
              disabled={!canEdit}
            />
            {form.pathError ? (
              <p className="text-destructive text-xs">{form.pathError}</p>
            ) : (
              <p className="text-muted-foreground text-xs">
                URL must be unique and start with /
              </p>
            )}
          </div>
        </div>
        <SaveSettingsButton
          canEdit={canEdit}
          isPending={form.isPending}
          hasChanges={form.hasChanges}
          pathError={form.pathError}
          isError={form.isError}
        />
      </form>
    </div>
  );
}

interface SaveSettingsButtonProps {
  canEdit: boolean;
  isPending: boolean;
  hasChanges: boolean;
  pathError: string | null;
  isError: boolean;
}

function SaveSettingsButton(props: SaveSettingsButtonProps) {
  if (!props.canEdit) {
    return (
      <RestrictedTooltip scope="can-manage-page-metadata">
        <SaveSettingsButtonInner {...props} />
      </RestrictedTooltip>
    );
  }
  return <SaveSettingsButtonInner {...props} />;
}

function SaveSettingsButtonInner({
  canEdit,
  isPending,
  hasChanges,
  pathError,
  isError,
}: SaveSettingsButtonProps) {
  return (
    <Button
      type="submit"
      disabled={!canEdit || isPending || !hasChanges || !!pathError}
      variant={isError ? "destructive" : "default"}
    >
      {isError ? (
        <>
          <RotateCcw className="size-4" /> Failed to update settings, try again
        </>
      ) : (
        "Save Settings"
      )}
    </Button>
  );
}

function usePageSettings() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data: page } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (data) => ({
      _id: data._id,
      title: data.title,
      path: data.path,
    }),
  });

  const [title, setTitle] = useState(page.title);
  const [path, setPath] = useState(page.path);
  const [pathError, setPathError] = useState<string | null>(null);
  const pageMutations = usePageMutations();

  const { mutate, isError } = useMutation({
    ...pageMutations.updatePageMetadata,
    onSuccess: () => {
      toast.success("Page settings updated");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const isPending = useIsPending(pageMutations.updatePageMetadata.mutationKey);

  const hasChanges = title !== page.title || path !== page.path;

  function validatePathField() {
    const result = validatePath(path);
    if (result.status === "invalid") {
      setPathError(result.error);
      return false;
    }
    setPathError(null);
    return true;
  }

  return {
    pageId: page._id,
    title,
    setTitle,
    path,
    setPath: (value: string) => {
      setPath(value);
      if (pathError) setPathError(null);
    },
    pathError,
    validatePathField,
    isPending,
    isError,
    hasChanges,
    submit: () => {
      if (!validatePathField()) return;
      mutate({ pageId: page._id, title, path });
    },
  };
}
