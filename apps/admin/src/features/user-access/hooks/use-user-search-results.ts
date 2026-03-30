import { useSuspenseQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useConvexPaginatedQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

import { USERS_PAGE_SIZE } from "~/features/user-access/constants";
import { userAccessQueries } from "~/features/user-access/lib/user-access-queries";
import { useLoadMoreOnIntersection } from "~/hooks/use-load-more-on-intersection";
import { sanitizeSearch } from "../lib/sanitize-search";

export function useUserSearchResults() {
  const searchTermFromUrl = useSearch({
    from: "/_authenticated/_authorized/dashboard",
    select: (search) => search.q,
  });
  const searchTerm = sanitizeSearch(searchTermFromUrl);

  const firstPageQuery = useSuspenseQuery({
    ...userAccessQueries.searchFirstPage(searchTerm),
    select: (data) => ({ page: data.page, isDone: data.isDone }),
  });
  const liveQuery = useConvexPaginatedQuery(
    api.users.searchUsersPaginated,
    {
      searchTerm,
    },
    {
      initialNumItems: USERS_PAGE_SIZE,
    },
  );

  const shouldUseLiveResults = liveQuery.status !== "LoadingFirstPage";
  const users = shouldUseLiveResults
    ? liveQuery.results
    : firstPageQuery.data.page;
  const status = shouldUseLiveResults
    ? liveQuery.status
    : firstPageQuery.data.isDone
      ? "Exhausted"
      : "CanLoadMore";

  const { sentinelRef } = useLoadMoreOnIntersection({
    canLoadMore: status === "CanLoadMore",
    loadMore: (numItems) => {
      if (!shouldUseLiveResults) {
        return;
      }

      liveQuery.loadMore(numItems);
    },
  });

  return {
    users,
    status,
    sentinelRef,
  };
}
