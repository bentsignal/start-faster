import { useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useConvexPaginatedQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";
import { ScrollArea } from "@acme/ui/scroll-area";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@acme/ui/sidebar";

import { EmptyState } from "~/features/common/components/empty-state";
import { ReleaseItem } from "~/features/pages/components/version-item/release-item";
import {
  pageQueries,
  RELEASES_PAGE_SIZE,
} from "~/features/pages/lib/page-queries";
import { useLoadMoreOnScroll } from "~/hooks/use-load-more-on-scroll";

function usePublishedList() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data: firstPage } = useSuspenseQuery({
    ...pageQueries.listReleasesFirstPage(pageId),
    select: (data) => ({ page: data.page, isDone: data.isDone }),
  });

  const live = useConvexPaginatedQuery(
    api.pages.releases.list,
    { pageId },
    { initialNumItems: RELEASES_PAGE_SIZE },
  );

  const useLive = live.status !== "LoadingFirstPage";
  const releases = useLive ? live.results : firstPage.page;
  const status = useLive
    ? live.status
    : firstPage.isDone
      ? ("Exhausted" as const)
      : ("CanLoadMore" as const);

  const scrollRef = useRef<HTMLDivElement>(null);
  useLoadMoreOnScroll({
    scrollRef,
    canLoadMore: status === "CanLoadMore",
    loadMore: (numItems) => {
      if (useLive) live.loadMore(numItems);
    },
    pageSize: RELEASES_PAGE_SIZE,
  });

  return { releases, scrollRef };
}

export function PublishedList() {
  const { releases, scrollRef } = usePublishedList();

  return (
    <SidebarGroup className="flex min-h-0 flex-1 flex-col pt-2">
      <SidebarGroupContent className="min-h-0 flex-1">
        <ScrollArea viewportRef={scrollRef} className="h-full">
          <SidebarMenu>
            {releases.length > 0 ? (
              releases.map((release, i) => (
                <ReleaseItem
                  key={release._id}
                  release={release}
                  isLatest={i === 0}
                />
              ))
            ) : (
              <EmptyState text="Nothing published yet" variant="sidebar" />
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
