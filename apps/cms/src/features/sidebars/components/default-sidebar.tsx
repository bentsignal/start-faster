import { useAuth } from "@workos/authkit-tanstack-react-start/client";
import { FileText, LayoutDashboard, Upload } from "lucide-react";

import { AccountItem } from "@acme/features/layout/account-item";
import { SignOutItem } from "@acme/features/layout/sign-out-item";
import { ThemeToggleItem } from "@acme/features/layout/theme-toggle-item";
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
} from "@acme/ui/sidebar";

import { env } from "~/env";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Pages", to: "/pages", icon: FileText },
  { label: "Files", to: "/files", icon: Upload },
] as const;

const ACTIVE_PROPS = { "data-active": "" } as const;

export function DefaultSidebar() {
  const { signOut, loading } = useAuth();

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="px-3 py-4">
        <span className="text-sidebar-foreground/70 text-xs font-medium tracking-widest uppercase">
          CMS
        </span>
      </SidebarHeader>
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
        <ThemeToggleItem />
        <AccountItem />
        <SignOutItem
          loading={loading}
          onSignOut={() => void signOut({ returnTo: env.VITE_SITE_URL })}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
