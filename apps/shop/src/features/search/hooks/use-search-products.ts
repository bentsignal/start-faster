import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";

export function useSearchProducts() {
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

  const data = query.data.pages[0];
  const products = query.data.pages.flatMap((page) =>
    (page?.nodes ?? []).filter((node) => node.__typename === "Product"),
  );
  const totalCount = data?.totalCount ?? 0;
  const hasNextPage = query.hasNextPage;
  const isFetchingNextPage = query.isFetchingNextPage;
  const canLoadMore = hasNextPage && !isFetchingNextPage;

  const fetchNextPage = async () => {
    if (!canLoadMore) return;
    await query.fetchNextPage();
  };

  return {
    data,
    products,
    totalCount,
    hasNextPage,
    isFetchingNextPage,
    canLoadMore,
    fetchNextPage,
  };
}
