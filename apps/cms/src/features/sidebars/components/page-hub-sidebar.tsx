import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useConvexPaginatedQuery } from "@convex-dev/react-query";
import { ChevronLeft, Loader, Plus, Settings } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { api } from "@acme/convex/api";
import { QuickLink } from "@acme/features/quick-link";
import { Button } from "@acme/ui/button";
import { ScrollArea } from "@acme/ui/scroll-area";
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
  SidebarSeparator,
} from "@acme/ui/sidebar";

import {
  DraftItem,
  ReleaseItem,
} from "~/features/pages/components/version-item";
import { useCreateDraftFromVersion } from "~/features/pages/hooks/use-create-draft-from-version";
import {
  DRAFTS_PAGE_SIZE,
  pageQueries,
} from "~/features/pages/lib/page-queries";
import { useLoadMoreOnIntersection } from "~/hooks/use-load-more-on-intersection";

export function PageHubSidebar() {
  return (
    <Sidebar variant="inset">
      <PageHubHeader />
      <SidebarSeparator />
      <SidebarContent className="min-h-0 flex-1 gap-0">
        <NavItems />
        <DraftsList />
        <ReleasesList />
      </SidebarContent>
    </Sidebar>
  );
}

function PageHubHeader() {
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

function NavItems() {
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

function useDraftsList(pageId: Id<"pages">) {
  const firstPageQuery = useQuery({
    ...pageQueries.listDraftsFirstPage(pageId),
  });
  const liveQuery = useConvexPaginatedQuery(
    api.pages.listDrafts,
    { pageId },
    { initialNumItems: DRAFTS_PAGE_SIZE },
  );

  const shouldUseLiveResults = liveQuery.status !== "LoadingFirstPage";
  const drafts = shouldUseLiveResults
    ? liveQuery.results
    : (firstPageQuery.data?.page ?? []);
  const status = shouldUseLiveResults
    ? liveQuery.status
    : firstPageQuery.isPending || firstPageQuery.data === undefined
      ? "LoadingFirstPage"
      : firstPageQuery.data.isDone
        ? "Exhausted"
        : "CanLoadMore";

  const { sentinelRef } = useLoadMoreOnIntersection({
    canLoadMore: status === "CanLoadMore",
    loadMore: (numItems) => {
      if (shouldUseLiveResults) {
        liveQuery.loadMore(numItems);
      }
    },
    pageSize: DRAFTS_PAGE_SIZE,
  });

  return { drafts, status, sentinelRef };
}

function DraftsList() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { drafts, status, sentinelRef } = useDraftsList(pageId);

  return (
    <SidebarGroup className="flex min-h-0 flex-1 flex-col">
      <SidebarGroupContent className="min-h-0 flex-1">
        <NewDraftButton />
        <ScrollArea className="mt-2 h-full">
          <SidebarMenu>
            {drafts.length > 0 ? (
              drafts.map((draft) => (
                <DraftItem key={draft._id} pageId={pageId} draft={draft} />
              ))
            ) : (
              <span className="text-sidebar-foreground/40 px-2 text-center text-xs">
                No drafts yet
              </span>
            )}
          </SidebarMenu>
          {status === "CanLoadMore" ? (
            <div ref={sentinelRef} className="h-1" />
          ) : null}
          {status === "LoadingFirstPage" ? (
            <div className="flex justify-center py-2">
              <Loader className="text-sidebar-foreground/30 size-4 animate-spin" />
            </div>
          ) : null}
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function ReleasesList() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data: releases } = useSuspenseQuery(
    pageQueries.listRecentReleases(pageId),
  );

  if (releases.length === 0) {
    return null;
  }

  return (
    <SidebarGroup className="flex min-h-0 flex-col">
      <SidebarGroupLabel className="text-sidebar-foreground/40 shrink-0 text-[11px] tracking-wider uppercase">
        Published
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {releases.map((release, i) => (
            <ReleaseItem
              key={release._id}
              pageId={pageId}
              release={{
                _id: release._id,
                name: release.name,
                creationTime: release._creationTime,
                isLatest: i === 0,
              }}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NewDraftButton() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const { mutate } = useCreateDraftFromVersion();

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={() => mutate({ pageId })}
    >
      <Plus className="size-3.5" />
      New Draft
    </Button>
  );
}
