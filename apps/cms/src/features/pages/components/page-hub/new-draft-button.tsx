import { useRouteContext } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import type { ButtonProps } from "@acme/ui/button";
import { Button } from "@acme/ui/button";

import { useCreateDraftFromVersion } from "~/features/pages/hooks/use-create-draft-from-version";
import { RestrictedTooltip } from "~/features/permissions/components/restricted-tooltip";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";

export function NewDraftButton() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const { mutate } = useCreateDraftFromVersion();
  const canCreate = useHasCmsScope("can-manage-page-content");

  if (!canCreate) {
    return (
      <RestrictedTooltip scope="can-manage-page-content" className="w-full">
        <ActualButton disabled />
      </RestrictedTooltip>
    );
  }

  return <ActualButton onClick={() => mutate({ pageId })} />;
}

function ActualButton(props: ButtonProps) {
  return (
    <Button variant="outline" size="sm" className="w-full" {...props}>
      <Plus className="size-3.5" />
      New Draft
    </Button>
  );
}
