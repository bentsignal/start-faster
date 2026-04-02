import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";

export function useSearchTotalCount() {
  const search = useSearch({
    from: "/search",
    select: (s) => ({
      q: s.q,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
      filters: s.filters,
    }),
  });

  const { data } = useSuspenseInfiniteQuery({
    ...searchQueries.productsInfinite({
      query: search.q,
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      filters: search.filters,
      first: SEARCH_PAGE_SIZE,
    }),
    refetchOnMount: false,
    select: (queryData) => queryData.pages[0]?.totalCount ?? 0,
  });

  return data;
}
