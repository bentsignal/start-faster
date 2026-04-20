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
import { DraftItem } from "~/features/pages/components/version-item/draft-item";
import {
  DRAFTS_PAGE_SIZE,
  pageQueries,
} from "~/features/pages/lib/page-queries";
import { useLoadMoreOnScroll } from "~/hooks/use-load-more-on-scroll";
import { NewDraftButton } from "./new-draft-button";

function useDraftsList() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data: firstPage } = useSuspenseQuery({
    ...pageQueries.listDraftsFirstPage(pageId),
    select: (data) => ({ page: data.page, isDone: data.isDone }),
  });

  const live = useConvexPaginatedQuery(
    api.pages.drafts.list,
    { pageId },
    { initialNumItems: DRAFTS_PAGE_SIZE },
  );

  const useLive = live.status !== "LoadingFirstPage";
  const drafts = useLive ? live.results : firstPage.page;
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
    pageSize: DRAFTS_PAGE_SIZE,
  });

  return { drafts, scrollRef };
}

export function DraftsList() {
  const { drafts, scrollRef } = useDraftsList();

  return (
    <SidebarGroup className="flex min-h-0 flex-1 flex-col pt-2">
      <SidebarGroupContent className="min-h-0 flex-1">
        <NewDraftButton />
        <ScrollArea viewportRef={scrollRef} className="mt-2 h-full">
          <SidebarMenu>
            {drafts.length > 0 ? (
              drafts.map((draft) => <DraftItem key={draft._id} draft={draft} />)
            ) : (
              <EmptyState text="No drafts yet" variant="sidebar" />
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
