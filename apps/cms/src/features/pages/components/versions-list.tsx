import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext, useSearch } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";

import type { Id } from "@acme/convex/model";
import type { VersionState } from "@acme/convex/types";
import { api } from "@acme/convex/api";
import { QuickLink } from "@acme/features/quick-link";
import { ScrollArea } from "@acme/ui/scroll-area";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@acme/ui/sidebar";

import type { VersionBadgeVariant } from "./version-badge";
import { formatRelativeTime } from "~/features/pages/lib/format-relative-time";
import { VersionBadge } from "./version-badge";

export function VersionsList() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DraftVersionsList />
      <PublishedVersionsList />
    </div>
  );
}

function DraftVersionsList() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const { data: drafts } = useSuspenseQuery({
    ...convexQuery(api.pages.listVersions, { pageId }),
    select: (data) =>
      data
        .filter((v) => v.state === "draft")
        .map((v) => ({
          _id: v._id,
          state: v.state,
          title: v.title,
          updatedAt: v.updatedAt,
        })),
  });

  const activeVersionId = useSearch({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (s) => s.versionId,
  });

  if (drafts.length === 0) {
    return null;
  }

  return (
    <VersionGroup label="Drafts">
      {drafts.map((version) => (
        <VersionItem
          key={version._id}
          pageId={pageId}
          version={version}
          isActive={version._id === activeVersionId}
          badge="draft"
        />
      ))}
    </VersionGroup>
  );
}

function PublishedVersionsList() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const { data: published } = useSuspenseQuery({
    ...convexQuery(api.pages.listVersions, { pageId }),
    select: (data) =>
      data
        .filter((v) => v.state === "published")
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((v) => ({
          _id: v._id,
          state: v.state,
          title: v.title,
          updatedAt: v.updatedAt,
        })),
  });

  const activeVersionId = useSearch({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (s) => s.versionId,
  });

  if (published.length === 0) {
    return null;
  }

  return (
    <VersionGroup label="Published">
      {published.map((version, index) => (
        <VersionItem
          key={version._id}
          pageId={pageId}
          version={version}
          isActive={version._id === activeVersionId}
          badge={index === 0 ? "live" : "previous"}
        />
      ))}
    </VersionGroup>
  );
}

function VersionGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarGroup className="flex min-h-0 flex-1 flex-col">
      <SidebarGroupLabel className="text-sidebar-foreground/40 shrink-0 text-[11px] tracking-wider uppercase">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <SidebarMenu>{children}</SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function VersionItem({
  pageId,
  version,
  isActive,
  badge,
}: {
  pageId: Id<"pages">;
  version: {
    _id: string;
    state: VersionState;
    title?: string;
    updatedAt: number;
  };
  isActive: boolean;
  badge: VersionBadgeVariant;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="sm"
        className="gap-3"
        isActive={isActive}
        render={
          <QuickLink
            to="/pages/$pageId"
            params={{ pageId }}
            search={{ versionId: version._id }}
          />
        }
      >
        <VersionBadge variant={badge} />
        <span className="truncate">{version.title ?? "Untitled"}</span>
        <span className="text-sidebar-foreground/30 ml-auto shrink-0 text-[10px] tabular-nums">
          {formatRelativeTime(version.updatedAt)}
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
