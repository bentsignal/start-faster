import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { ChevronLeft, Loader, Plus } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { QuickLink } from "@acme/features/quick-link";
import { Button } from "@acme/ui/button";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@acme/ui/sidebar";
import { toast } from "@acme/ui/toaster";

import { VersionsList } from "~/features/pages/components/versions-list";
import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { useIsPending } from "~/hooks/use-is-pending";

export function PageDetailSidebar() {
  return (
    <Sidebar variant="inset">
      <PageDetailHeader />
      <SidebarSeparator />
      <VersionsList />
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <NewDraftButton />
      </SidebarFooter>
    </Sidebar>
  );
}

function PageDetailHeader() {
  return (
    <SidebarHeader className="gap-3 px-3 py-4">
      <QuickLink
        to="/pages"
        className="text-sidebar-foreground/50 hover:text-sidebar-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Pages
      </QuickLink>
    </SidebarHeader>
  );
}

function NewDraftButton() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const { createDraft, isCreating } = useNewDraft(pageId);

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      disabled={isCreating}
      onClick={createDraft}
    >
      {isCreating ? (
        <Loader className="size-3.5 animate-spin" />
      ) : (
        <Plus className="size-3.5" />
      )}
      New Draft
    </Button>
  );
}

function useNewDraft(pageId: Id<"pages">) {
  const navigate = useNavigate();
  const pageMutations = usePageMutations();
  const isCreating = useIsPending(pageMutations.createNewDraft.mutationKey);

  const { mutate } = useMutation({
    ...pageMutations.createNewDraft,
    onSuccess: (versionId: Id<"pageVersions">) => {
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
    createDraft: () => mutate({ pageId, fromVersionId: undefined }),
    isCreating,
  };
}
