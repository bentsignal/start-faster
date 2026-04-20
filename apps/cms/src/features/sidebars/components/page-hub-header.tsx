import { useRouteContext } from "@tanstack/react-router";
import { ChevronLeft, Settings } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@acme/ui/sidebar";

export function PageHubHeader() {
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

export function PageHubNavItems() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="sm"
              render={
                <QuickLink
                  to="/pages/$pageId/settings"
                  params={{ pageId }}
                  activeProps={{ "data-active": "" }}
                />
              }
            >
              <Settings className="size-3.5" />
              <span>Page Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
