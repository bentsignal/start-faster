import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarSeparator,
} from "@acme/ui/sidebar";

import { formatRelativeTime } from "~/features/pages/lib/format-relative-time";
import { pageQueries } from "~/features/pages/lib/page-queries";

export function SettingsSidebar() {
  return (
    <Sidebar variant="inset">
      <SettingsSidebarHeader />
      <SidebarSeparator />
      <SidebarContent>
        <LastUpdated />
      </SidebarContent>
    </Sidebar>
  );
}

function SettingsSidebarHeader() {
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

function LastUpdated() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (data) => ({ creationTime: data._creationTime }),
  });

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <p className="text-sidebar-foreground/40 px-2 text-xs">
          Created {formatRelativeTime(data.creationTime)}
        </p>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
