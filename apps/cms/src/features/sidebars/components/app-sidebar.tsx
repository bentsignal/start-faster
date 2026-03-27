import { useMatch } from "@tanstack/react-router";
import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { FileText, LayoutDashboard, Upload } from "lucide-react";

import { AccountItem } from "@acme/features/layout/account-item";
import { SignOutItem } from "@acme/features/layout/sign-out-item";
import { QuickLink } from "@acme/features/quick-link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@acme/ui/sidebar";

import { env } from "~/env";
import { PageDetailSidebar } from "./page-detail-sidebar";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Pages", to: "/pages", icon: FileText },
  { label: "Files", to: "/files", icon: Upload },
] as const;

const ACTIVE_PROPS = { "data-active": "" } as const;

export function AppSidebar() {
  const match = useMatch({
    from: "/_authenticated/_authorized/pages/$pageId",
    shouldThrow: false,
  });

  return match ? <PageDetailSidebar /> : <DefaultSidebar />;
}

function DefaultSidebar() {
  const { signOut, loading } = useAuth();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="px-3 py-4">
        <span className="text-sidebar-foreground/70 text-xs font-medium tracking-widest uppercase">
          CMS
        </span>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    render={
                      <QuickLink to={item.to} activeProps={ACTIVE_PROPS} />
                    }
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <AccountItem />
        <SignOutItem
          loading={loading}
          onSignOut={() => void signOut({ returnTo: env.VITE_SITE_URL })}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
