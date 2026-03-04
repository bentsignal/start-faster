import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
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

  const { data } = useSuspenseQuery({
    ...searchQueries.products({
      query: search.q,
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      filters: search.filters,
      first: SEARCH_PAGE_SIZE,
      after: search.page === 1 ? undefined : search.cursor,
    }),
    refetchOnMount: false,
  });
  const products =
    data?.nodes.filter((node) => node.__typename === "Product") ?? [];

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / SEARCH_PAGE_SIZE));
  const activePage = Math.min(search.page, totalPages);

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
            sortDirection:
              nextSortBy === "relevance" ? "desc" : search.sortDirection,
            filters: search.filters,
            page: 1,
            cursor: undefined,
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
            page: 1,
            cursor: undefined,
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
            page: 1,
            cursor: undefined,
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
            page: 1,
            cursor: undefined,
          },
        }),
    });
  };

  const onPageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === activePage) {
      return;
    }

    await navigate({
      to: "/search",
      search: {
        q: search.q,
        sortBy: search.sortBy,
        sortDirection: search.sortDirection,
        filters: search.filters,
        page: nextPage,
        cursor: undefined,
      },
    });
  };

  const isFiltering = isFilterNavigationLoading || isPriceApplyLoading;

  return {
    search,
    filters: search.filters,
    data,
    products,
    totalCount,
    totalPages,
    activePage,
    isFiltering,
    isPriceApplyLoading,
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
    onPageChange,
  };
}

export const { Store: SearchPageStore, useStore: useSearchPageStore } =
  createStore(useInternalStore);
