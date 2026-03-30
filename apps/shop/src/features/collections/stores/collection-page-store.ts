import { useState } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { createStore } from "rostra";

import type { ProductFilter } from "@acme/shopify/storefront/types";

import type {
  CollectionSortBy,
  CollectionSortDirection,
} from "~/features/collections/lib/collection-queries";
import {
  applyPriceRangeFilter,
  toggleFilter,
} from "~/features/collections/lib/collection-filter-utils";
import {
  COLLECTION_PAGE_SIZE,
  collectionQueries,
} from "~/features/collections/lib/collection-queries";

async function runWithLoading({
  setLoading,
  action,
}: {
  setLoading: (isLoading: boolean) => void;
  action: () => Promise<void>;
}) {
  setLoading(true);
  await action().finally(() => {
    setLoading(false);
  });
}

type CollectionNavigateFn = (opts: {
  to: "/collections/$handle";
  params: { handle: string };
  search: {
    sortBy: CollectionSortBy;
    sortDirection: CollectionSortDirection;
    filters: ProductFilter[];
  };
}) => Promise<void>;

function createCollectionNavigator({
  navigate,
  params,
  searchState,
  setIsFilterNavigationLoading,
  setIsPriceApplyLoading,
}: {
  navigate: CollectionNavigateFn;
  params: { handle: string };
  searchState: {
    sortBy: CollectionSortBy;
    sortDirection: CollectionSortDirection;
    urlFilters: ProductFilter[];
  };
  setIsFilterNavigationLoading: (isLoading: boolean) => void;
  setIsPriceApplyLoading: (isLoading: boolean) => void;
}) {
  const onSortByChange = (nextSortBy: CollectionSortBy) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/collections/$handle",
          params: { handle: params.handle },
          search: {
            sortBy: nextSortBy,
            sortDirection: searchState.sortDirection,
            filters: searchState.urlFilters,
          },
        }),
    });
  };

  const onSortDirectionChange = (
    nextSortDirection: CollectionSortDirection,
  ) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/collections/$handle",
          params: { handle: params.handle },
          search: {
            sortBy: searchState.sortBy,
            sortDirection: nextSortDirection,
            filters: searchState.urlFilters,
          },
        }),
    });
  };

  const onToggleFilter = (input: ProductFilter) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/collections/$handle",
          params: { handle: params.handle },
          search: {
            sortBy: searchState.sortBy,
            sortDirection: searchState.sortDirection,
            filters: toggleFilter(searchState.urlFilters, input),
          },
        }),
    });
  };

  const onApplyPriceRange = (min: string, max: string) => {
    void runWithLoading({
      setLoading: setIsPriceApplyLoading,
      action: () =>
        navigate({
          to: "/collections/$handle",
          params: { handle: params.handle },
          search: {
            sortBy: searchState.sortBy,
            sortDirection: searchState.sortDirection,
            filters: applyPriceRangeFilter({
              filters: searchState.urlFilters,
              min,
              max,
            }),
          },
        }),
    });
  };

  return {
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
  };
}

function useInternalStore() {
  const navigate = useNavigate({ from: "/collections/$handle" });
  const params = useParams({ from: "/collections/$handle" });
  const { sortBy, sortDirection, urlFilters } = useSearch({
    from: "/collections/$handle",
    select: (search) => ({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      urlFilters: search.filters,
    }),
  });
  const [isFilterNavigationLoading, setIsFilterNavigationLoading] =
    useState(false);
  const [isPriceApplyLoading, setIsPriceApplyLoading] = useState(false);

  const query = useSuspenseInfiniteQuery({
    ...collectionQueries.productsInfinite({
      handle: params.handle,
      sortBy,
      sortDirection,
      filters: urlFilters,
      first: COLLECTION_PAGE_SIZE,
    }),
    refetchOnMount: false,
  });

  const collection = query.data.pages[0];
  const products = query.data.pages.flatMap(
    (page) => page?.products.nodes ?? [],
  );
  const filters = collection?.products.filters ?? [];
  const hasNextPage = query.hasNextPage;
  const isFetchingNextPage = query.isFetchingNextPage;
  const canLoadMore = hasNextPage && !isFetchingNextPage;

  const {
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
  } = createCollectionNavigator({
    navigate,
    params,
    searchState: { sortBy, sortDirection, urlFilters },
    setIsFilterNavigationLoading,
    setIsPriceApplyLoading,
  });

  const fetchNextPage = async () => {
    if (!canLoadMore) {
      return;
    }

    await query.fetchNextPage();
  };

  const isFiltering = isFilterNavigationLoading || isPriceApplyLoading;

  return {
    collection,
    products,
    filters,
    hasNextPage,
    isFetchingNextPage,
    canLoadMore,
    isFiltering,
    isPriceApplyLoading,
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
    fetchNextPage,
  };
}

export const { Store: CollectionPageStore, useStore: useCollectionPageStore } =
  createStore(useInternalStore);
