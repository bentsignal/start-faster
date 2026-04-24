import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Eye, EyeOff, X } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toaster";

import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { pageQueries } from "~/features/pages/lib/page-queries";
import { RestrictedTooltip } from "~/features/permissions/components/restricted-tooltip";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";

export function PageVisibilityToggle({ pageId }: { pageId: Id<"pages"> }) {
  const {
    isVisible,
    confirming,
    startConfirm,
    cancelConfirm,
    toggle,
    isPending,
  } = usePageVisibilityToggle(pageId);
  const canEdit = useHasCmsScope("can-manage-page-metadata");

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium">Visibility</div>
      <div className="flex items-center gap-4 rounded-xl border p-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {isVisible ? (
            <Eye className="text-muted-foreground size-4 shrink-0" />
          ) : (
            <EyeOff className="text-muted-foreground size-4 shrink-0" />
          )}
          <div className="ml-1 min-w-0 space-y-1">
            <p className="truncate text-sm font-medium">
              {isVisible ? "Visible to the public" : "Hidden from the public"}
            </p>
            <p className="text-muted-foreground truncate text-xs">
              {isVisible
                ? "Live on the shop and listed in the sitemap."
                : "Returns a 404 and is excluded from the sitemap."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          {!canEdit ? (
            <RestrictedTooltip scope="can-manage-page-metadata">
              <Button size="sm" variant="outline" disabled>
                {isVisible ? "Hide page" : "Make visible"}
              </Button>
            </RestrictedTooltip>
          ) : confirming ? (
            <>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                Are you sure?
              </span>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={cancelConfirm}
                disabled={isPending}
              >
                <X className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant={isVisible ? "destructive" : "default"}
                onClick={toggle}
                disabled={isPending}
              >
                {isVisible ? "Hide page" : "Make visible"}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={startConfirm}
              disabled={isPending}
            >
              {isVisible ? "Hide page" : "Make visible"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function usePageVisibilityToggle(pageId: Id<"pages">) {
  const { data: isVisible } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (data) => data.isVisible,
  });

  const [confirming, setConfirming] = useState(false);
  const pageMutations = usePageMutations();

  const { mutate, isPending } = useMutation({
    ...pageMutations.updatePageMetadata,
    onSuccess: () => {
      setConfirming(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update visibility",
      );
    },
  });

  return {
    isVisible,
    confirming,
    startConfirm: () => setConfirming(true),
    cancelConfirm: () => setConfirming(false),
    toggle: () => mutate({ pageId, isVisible: !isVisible }),
    isPending,
  };
}
