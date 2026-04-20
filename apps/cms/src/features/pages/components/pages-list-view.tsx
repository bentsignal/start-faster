import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";
import { useConvexPaginatedQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

import { PageListRow } from "~/features/pages/components/page-list-row";
import {
  pageQueries,
  PAGES_PAGE_SIZE,
} from "~/features/pages/lib/page-queries";
import { useLoadMoreOnWindowScroll } from "~/hooks/use-load-more-on-window-scroll";

const pagesRoute = getRouteApi("/_authenticated/_authorized/pages/");

function usePagesListView() {
  const searchTerm = pagesRoute.useSearch({ select: (s) => s.q });

  const { data: firstPage } = useSuspenseQuery({
    ...pageQueries.listFirstPage(searchTerm),
    select: (data) => ({ page: data.page, isDone: data.isDone }),
  });

  const live = useConvexPaginatedQuery(
    api.pages.manage.listPaginated,
    { searchTerm },
    { initialNumItems: PAGES_PAGE_SIZE },
  );

  const useLive = live.status !== "LoadingFirstPage";
  const pages = useLive ? live.results : firstPage.page;
  const status = useLive
    ? live.status
    : firstPage.isDone
      ? ("Exhausted" as const)
      : ("CanLoadMore" as const);

  useLoadMoreOnWindowScroll({
    canLoadMore: status === "CanLoadMore",
    loadMore: (numItems) => {
      if (useLive) live.loadMore(numItems);
    },
    pageSize: PAGES_PAGE_SIZE,
  });

  return { pages, searchTerm };
}

export function PagesListView() {
  const { pages, searchTerm } = usePagesListView();

  if (pages.length === 0) {
    return (
      <div className="text-muted-foreground px-1 py-8 text-sm">
        {searchTerm ? "No pages match your search." : "No pages yet."}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {pages.map((page) => (
        <li key={page._id}>
          <PageListRow page={page} />
        </li>
      ))}
    </ul>
  );
}
