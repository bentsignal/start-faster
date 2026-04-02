import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";
import { LoadMorePagination } from "~/features/shared/filters/components/pagination";

function useSearchPagination() {
  const search = useSearch({
    from: "/search",
    select: (s) => ({
      q: s.q,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
      filters: s.filters,
    }),
  });

  const query = useSuspenseInfiniteQuery({
    ...searchQueries.productsInfinite({
      query: search.q,
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      filters: search.filters,
      first: SEARCH_PAGE_SIZE,
    }),
    refetchOnMount: false,
  });

  const hasNextPage = query.hasNextPage;
  const isFetchingNextPage = query.isFetchingNextPage;
  const canLoadMore = hasNextPage && !isFetchingNextPage;

  const fetchNextPage = async () => {
    if (!canLoadMore) return;
    await query.fetchNextPage();
  };

  return { hasNextPage, isFetchingNextPage, canLoadMore, fetchNextPage };
}

export function SearchPagination() {
  const { hasNextPage, canLoadMore, isFetchingNextPage, fetchNextPage } =
    useSearchPagination();

  return (
    <LoadMorePagination
      hasNextPage={hasNextPage}
      canLoadMore={canLoadMore}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
