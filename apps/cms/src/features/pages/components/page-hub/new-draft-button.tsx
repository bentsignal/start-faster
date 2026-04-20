import { useRouteContext } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "@acme/ui/button";

import { useCreateDraftFromVersion } from "~/features/pages/hooks/use-create-draft-from-version";

export function NewDraftButton() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const { mutate } = useCreateDraftFromVersion();
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={() => mutate({ pageId })}
    >
      <Plus className="size-3.5" />
      New Draft
    </Button>
  );
}
