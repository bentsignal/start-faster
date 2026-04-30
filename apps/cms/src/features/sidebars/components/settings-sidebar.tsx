import { getRouteApi, useRouteContext } from "@tanstack/react-router";
import { ChevronLeft, Eye, Info, Search, Settings } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@acme/ui/sidebar";

import type { SettingsTab } from "~/features/pages/lib/settings-tab";

const settingsRoute = getRouteApi(
  "/_authenticated/_authorized/pages/$pageId/settings",
);

const TABS = [
  { value: "general", label: "General", icon: Settings },
  { value: "seo", label: "SEO", icon: Search },
  { value: "visibility", label: "Visibility", icon: Eye },
  { value: "information", label: "Information", icon: Info },
] as const satisfies readonly {
  value: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[];

export function SettingsSidebar() {
  return (
    <Sidebar variant="inset">
      <SettingsSidebarHeader />
      <SidebarContent>
        <SettingsNav />
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

function SettingsNav() {
  const activeTab = settingsRoute.useSearch({ select: (s) => s.settingsTab });
  const navigate = settingsRoute.useNavigate();

  function selectTab(tab: SettingsTab) {
    void navigate({ search: (prev) => ({ ...prev, settingsTab: tab }) });
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Settings</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {TABS.map((tab) => (
            <SidebarMenuItem key={tab.value}>
              <SidebarMenuButton
                size="sm"
                isActive={activeTab === tab.value}
                onClick={() => selectTab(tab.value)}
              >
                <tab.icon className="size-3.5" />
                <span>{tab.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
