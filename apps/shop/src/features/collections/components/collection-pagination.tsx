import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "@tanstack/react-router";

import {
  COLLECTION_PAGE_SIZE,
  collectionQueries,
} from "~/features/collections/lib/collection-queries";
import { LoadMorePagination } from "~/features/shared/filters/components/pagination";

function useCollectionPagination() {
  const handle = useParams({
    from: "/collections/$handle",
    select: (params) => params.handle,
  });
  const searchState = useSearch({
    from: "/collections/$handle",
    select: (search) => ({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      urlFilters: search.filters,
    }),
  });

  const query = useSuspenseInfiniteQuery({
    ...collectionQueries.productsInfinite({
      handle,
      sortBy: searchState.sortBy,
      sortDirection: searchState.sortDirection,
      filters: searchState.urlFilters,
      first: COLLECTION_PAGE_SIZE,
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

export function CollectionPagination() {
  const { hasNextPage, canLoadMore, isFetchingNextPage, fetchNextPage } =
    useCollectionPagination();

  return (
    <LoadMorePagination
      hasNextPage={hasNextPage}
      canLoadMore={canLoadMore}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
