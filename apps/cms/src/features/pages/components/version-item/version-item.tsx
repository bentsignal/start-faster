import type { ReactElement, ReactNode } from "react";

import { SidebarMenuButton, SidebarMenuItem } from "@acme/ui/sidebar";

import type { VersionBadgeVariant } from "./version-badge";
import { TimeLabel } from "./time-label";
import { VersionBadge } from "./version-badge";

/**
 * Shared shell for all version items (draft/release/scheduled).
 *
 * The `link` slot is the fully-typed `<QuickLink ... />` element rendered
 * into the `SidebarMenuButton`. The `actionsMenu` slot is the trailing
 * dropdown (trigger + content). Consumers also control the `SidebarMenuItem`
 * open state via `isMenuOpen`.
 */
export function VersionItemShell({
  badge,
  name,
  time,
  link,
  actionsMenu,
  isMenuOpen,
}: {
  badge: VersionBadgeVariant;
  name: string;
  time: { kind: "past" | "future"; timestamp: number };
  link: ReactElement;
  actionsMenu: ReactNode;
  isMenuOpen: boolean;
}) {
  return (
    <SidebarMenuItem
      className="group/version-item"
      data-menu-open={isMenuOpen || undefined}
    >
      <SidebarMenuButton
        size="sm"
        className="group-hover/version-item:bg-sidebar-accent group-hover/version-item:text-sidebar-accent-foreground gap-3"
        render={link}
      >
        <VersionBadge variant={badge} />
        <span className="truncate">{name}</span>
        <TimeLabel timestamp={time.timestamp} tense={time.kind} />
      </SidebarMenuButton>
      {actionsMenu}
    </SidebarMenuItem>
  );
}
