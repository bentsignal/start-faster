import { useState } from "react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { createStore } from "rostra";

import type { ProductFilter } from "@acme/shopify/storefront/types";

import type {
  SearchSortBy,
  SearchSortDirection,
} from "~/features/search/lib/search-queries";
import {
  applyPriceRangeFilter,
  toggleFilter,
} from "~/features/search/lib/search-filter-utils";
import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";

function useInternalStore() {
  const navigate = useNavigate({ from: "/search" });
  const search = useSearch({ from: "/search" });
  const [isFilterNavigationLoading, setIsFilterNavigationLoading] =
    useState(false);
  const [isPriceApplyLoading, setIsPriceApplyLoading] = useState(false);

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

  const runWithLoading = async ({
    setLoading,
    action,
  }: {
    setLoading: (isLoading: boolean) => void;
    action: () => Promise<void>;
  }) => {
    setLoading(true);
    await action().finally(() => {
      setLoading(false);
    });
  };

  const onSortByChange = (nextSortBy: SearchSortBy) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/search",
          search: {
            q: search.q,
            sortBy: nextSortBy,
            sortDirection: search.sortDirection,
            filters: search.filters,
          },
        }),
    });
  };

  const onSortDirectionChange = (nextSortDirection: SearchSortDirection) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/search",
          search: {
            q: search.q,
            sortBy: search.sortBy,
            sortDirection: nextSortDirection,
            filters: search.filters,
          },
        }),
    });
  };

  const onToggleFilter = (input: ProductFilter) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/search",
          search: {
            q: search.q,
            sortBy: search.sortBy,
            sortDirection: search.sortDirection,
            filters: toggleFilter(search.filters, input),
          },
        }),
    });
  };

  const onApplyPriceRange = (min: string, max: string) => {
    void runWithLoading({
      setLoading: setIsPriceApplyLoading,
      action: () =>
        navigate({
          to: "/search",
          search: {
            q: search.q,
            sortBy: search.sortBy,
            sortDirection: search.sortDirection,
            filters: applyPriceRangeFilter({
              filters: search.filters,
              min,
              max,
            }),
          },
        }),
    });
  };

  const fetchNextPage = async () => {
    if (!canLoadMore) {
      return;
    }

    await query.fetchNextPage();
  };

  const isFiltering = isFilterNavigationLoading || isPriceApplyLoading;

  return {
    search,
    filters: search.filters,
    data,
    products,
    totalCount,
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

export const { Store: SearchPageStore, useStore: useSearchPageStore } =
  createStore(useInternalStore);
