import { Sidebar, SidebarContent } from "@acme/ui/sidebar";

import { PageHubHeader, PageHubNavItems } from "./page-hub-header";
import { ActiveTabList, PageHubTabs } from "./page-hub-tabs";

export function PageHubSidebar() {
  return (
    <Sidebar variant="inset">
      <PageHubHeader />
      <SidebarContent className="min-h-0 flex-1 gap-0 overflow-hidden">
        <PageHubNavItems />
        <PageHubTabs />
        <ActiveTabList />
      </SidebarContent>
    </Sidebar>
  );
}
