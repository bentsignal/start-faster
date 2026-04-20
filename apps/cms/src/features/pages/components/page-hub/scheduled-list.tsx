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
import { ScheduledItem } from "~/features/pages/components/version-item/scheduled-item";
import {
  pageQueries,
  SCHEDULED_PAGE_SIZE,
} from "~/features/pages/lib/page-queries";
import { useLoadMoreOnScroll } from "~/hooks/use-load-more-on-scroll";

function useScheduledList() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data: firstPage } = useSuspenseQuery({
    ...pageQueries.listScheduledFirstPage(pageId),
    select: (data) => ({ page: data.page, isDone: data.isDone }),
  });

  const live = useConvexPaginatedQuery(
    api.pages.scheduled.listForPage,
    { pageId },
    { initialNumItems: SCHEDULED_PAGE_SIZE },
  );

  const useLive = live.status !== "LoadingFirstPage";
  const scheduled = useLive ? live.results : firstPage.page;
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
    pageSize: SCHEDULED_PAGE_SIZE,
  });

  return { scheduled, scrollRef };
}

export function ScheduledList() {
  const { scheduled, scrollRef } = useScheduledList();

  return (
    <SidebarGroup className="flex min-h-0 flex-1 flex-col pt-2">
      <SidebarGroupContent className="min-h-0 flex-1">
        <ScrollArea viewportRef={scrollRef} className="h-full">
          <SidebarMenu>
            {scheduled.length > 0 ? (
              scheduled.map((row) => (
                <ScheduledItem key={row._id} scheduled={row} />
              ))
            ) : (
              <EmptyState text="Nothing scheduled" variant="sidebar" />
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
