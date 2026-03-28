import { useRouteContext } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@acme/ui/sidebar";

import { SaveStatus } from "~/features/pages/components/draft-save-status";
import { PublishButton } from "~/features/pages/components/publish-draft-button";
import { RenameDraftButton } from "~/features/pages/components/rename-draft-button";

export function DraftSidebar() {
  return (
    <Sidebar variant="inset">
      <DraftSidebarHeader />
      <SidebarSeparator />
      <SidebarContent>
        <RenameDraftButton />
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <SaveStatus />
        <PublishButton />
      </SidebarFooter>
    </Sidebar>
  );
}

function DraftSidebarHeader() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  return (
    <SidebarHeader className="gap-3 px-3 py-4">
      <QuickLink
        to="/pages/$pageId"
        params={{ pageId }}
        className="text-sidebar-foreground/50 hover:text-sidebar-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
      >
        <ChevronLeft className="size-3.5" />
        Page Overview
      </QuickLink>
    </SidebarHeader>
  );
}
