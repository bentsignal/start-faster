import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw } from "lucide-react";
import { z } from "zod";

import { Button } from "@acme/ui/button";

import { GeneralSettings } from "~/features/pages/components/general-settings";
import { PageInformation } from "~/features/pages/components/page-information";
import { SeoFields } from "~/features/pages/components/seo-fields";
import { VisibilitySettings } from "~/features/pages/components/visibility-settings";
import { usePageSettings } from "~/features/pages/hooks/use-page-settings";
import { settingsTabValidator } from "~/features/pages/lib/settings-tab";
import { PermissionNoticeBanner } from "~/features/permissions/components/permission-notice";
import { RestrictedTooltip } from "~/features/permissions/components/restricted-tooltip";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";

export const Route = createFileRoute(
  "/_authenticated/_authorized/pages/$pageId/settings",
)({
  component: RouteComponent,
  validateSearch: z.object({
    settingsTab: settingsTabValidator,
  }),
});

function RouteComponent() {
  const form = usePageSettings();
  const canEdit = useHasCmsScope("can-manage-page-metadata");
  const tab = Route.useSearch({ select: (s) => s.settingsTab });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10 sm:px-8">
      {canEdit ? null : (
        <PermissionNoticeBanner scope="can-manage-page-metadata" />
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
        className="flex flex-col gap-6"
      >
        <ActiveTabContent tab={tab} form={form} canEdit={canEdit} />
        {(tab === "general" || tab === "seo") && (
          <SaveSettingsButton
            canEdit={canEdit}
            isPending={form.isPending}
            hasChanges={form.hasChanges}
            pathError={form.pathError}
            isError={form.isError}
          />
        )}
      </form>
    </div>
  );
}

function ActiveTabContent({
  tab,
  form,
  canEdit,
}: {
  tab: string;
  form: ReturnType<typeof usePageSettings>;
  canEdit: boolean;
}) {
  switch (tab) {
    case "general":
      return (
        <GeneralSettings
          title={form.title}
          setTitle={form.setTitle}
          path={form.path}
          setPath={form.setPath}
          pathError={form.pathError}
          validatePathField={form.validatePathField}
          canEdit={canEdit}
        />
      );
    case "seo":
      return (
        <SeoFields
          seoDescription={form.seoDescription}
          setSeoDescription={form.setSeoDescription}
          seoImage={form.seoImage}
          onImageSelect={form.handleImageSelect}
          onImageRemove={form.handleImageRemove}
          onImageAltChange={form.handleImageAltChange}
          canEdit={canEdit}
        />
      );
    case "visibility":
      return <VisibilitySettings pageId={form.pageId} />;
    case "information":
      return <PageInformation />;
    default:
      return null;
  }
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
