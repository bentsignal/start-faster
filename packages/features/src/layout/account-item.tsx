import { CircleUserRound } from "lucide-react";

import { QuickLink } from "@acme/features/quick-link";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@acme/ui/sidebar";

export function AccountItem() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="sm"
          render={
            <QuickLink to="/account" activeProps={{ "data-active": "" }} />
          }
        >
          <CircleUserRound className="size-4" />
          <span>Account</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
