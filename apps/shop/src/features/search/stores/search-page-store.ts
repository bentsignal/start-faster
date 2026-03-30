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

type SearchNavigateFn = (opts: {
  to: "/search";
  search: {
    q: string;
    sortBy: SearchSortBy;
    sortDirection: SearchSortDirection;
    filters: ProductFilter[];
  };
}) => Promise<void>;

function createSearchNavigator({
  navigate,
  searchState,
  setIsFilterNavigationLoading,
  setIsPriceApplyLoading,
}: {
  navigate: SearchNavigateFn;
  searchState: {
    q: string;
    sortBy: SearchSortBy;
    sortDirection: SearchSortDirection;
    filters: ProductFilter[];
  };
  setIsFilterNavigationLoading: (isLoading: boolean) => void;
  setIsPriceApplyLoading: (isLoading: boolean) => void;
}) {
  const onSortByChange = (nextSortBy: SearchSortBy) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/search",
          search: {
            q: searchState.q,
            sortBy: nextSortBy,
            sortDirection: searchState.sortDirection,
            filters: searchState.filters,
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
            q: searchState.q,
            sortBy: searchState.sortBy,
            sortDirection: nextSortDirection,
            filters: searchState.filters,
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
            q: searchState.q,
            sortBy: searchState.sortBy,
            sortDirection: searchState.sortDirection,
            filters: toggleFilter(searchState.filters, input),
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
            q: searchState.q,
            sortBy: searchState.sortBy,
            sortDirection: searchState.sortDirection,
            filters: applyPriceRangeFilter({
              filters: searchState.filters,
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
  const navigate = useNavigate({ from: "/search" });
  const search = useSearch({
    from: "/search",
    select: (s) => ({
      q: s.q,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
      filters: s.filters,
    }),
  });
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

  const {
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
  } = createSearchNavigator({
    navigate,
    searchState: search,
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
