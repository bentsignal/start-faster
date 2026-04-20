import { useRouteContext } from "@tanstack/react-router";
import { EyeOff } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";
import { Button } from "@acme/ui/button";

export function PageHubHiddenEmpty() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  return (
    <div className="flex h-full flex-1 items-center justify-center p-6">
      <div className="bg-muted/30 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed p-8 text-center">
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <EyeOff className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-medium">This page is hidden</p>
          <p className="text-muted-foreground text-sm">
            It is not viewable on the shop and is excluded from the sitemap.
          </p>
        </div>
        <Button
          size="sm"
          render={
            <QuickLink to="/pages/$pageId/settings" params={{ pageId }} />
          }
        >
          Go to page settings
        </Button>
      </div>
    </div>
  );
}
