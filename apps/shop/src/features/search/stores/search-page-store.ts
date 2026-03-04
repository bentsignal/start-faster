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

  const navigateToSearch = ({
    sortBy,
    sortDirection,
    nextFilters,
    page,
    cursor,
  }: {
    sortBy: SearchSortBy;
    sortDirection: SearchSortDirection;
    nextFilters: ProductFilter[];
    page: number;
    cursor?: string;
  }) =>
    navigate({
      to: "/search",
      search: {
        q: search.q,
        sortBy,
        sortDirection,
        filters: nextFilters,
        page,
        cursor,
      },
    });

  const onSortByChange = (nextSortBy: SearchSortBy) => {
    void navigateToSearch({
      sortBy: nextSortBy,
      sortDirection: nextSortBy === "relevance" ? "desc" : search.sortDirection,
      nextFilters: search.filters,
      page: 1,
    });
  };

  const onSortDirectionChange = (nextSortDirection: SearchSortDirection) => {
    void navigateToSearch({
      sortBy: search.sortBy,
      sortDirection: nextSortDirection,
      nextFilters: search.filters,
      page: 1,
    });
  };

  const onToggleFilter = (input: ProductFilter) => {
    void navigateToSearch({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      nextFilters: toggleFilter(search.filters, input),
      page: 1,
    });
  };

  const onApplyPriceRange = (min: string, max: string) => {
    void navigateToSearch({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      nextFilters: applyPriceRangeFilter({
        filters: search.filters,
        min,
        max,
      }),
      page: 1,
    });
  };

  const onPageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === activePage) {
      return;
    }

    await navigateToSearch({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      nextFilters: search.filters,
      page: nextPage,
      cursor: undefined,
    });
  };

  return {
    search,
    filters: search.filters,
    data,
    products,
    totalCount,
    totalPages,
    activePage,
    pageJumpLoading: false,
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
    onPageChange,
  };
}

export const { Store: SearchPageStore, useStore: useSearchPageStore } =
  createStore(useInternalStore);
