import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createStore } from "rostra";

import type { ProductFilter } from "@acme/shopify/storefront/types";

import type {
  SearchSortBy,
  SearchSortDirection,
} from "~/features/search/lib/search-queries";
import type { SearchRouteSearch } from "~/features/search/lib/search-route";
import {
  applyPriceRangeFilter,
  toggleFilter,
} from "~/features/search/lib/search-filter-utils";
import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";
import { toProductFilters } from "~/features/search/lib/search-route";
import { useLoading } from "~/hooks/use-loading";

function useInternalStore({ search }: { search: SearchRouteSearch }) {
  const navigate = useNavigate({ from: "/search" });
  const filters = toProductFilters(search.filters);
  const { isLoading: pageJumpLoading, start: startPageJump } = useLoading();

  const { data } = useSuspenseQuery(
    searchQueries.products({
      query: search.q,
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      filters,
      first: SEARCH_PAGE_SIZE,
      after: search.page === 1 ? undefined : search.cursor,
    }),
  );

  const totalPages = Math.max(1, Math.ceil(data.totalCount / SEARCH_PAGE_SIZE));
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
      nextFilters: filters,
      page: 1,
    });
  };

  const onSortDirectionChange = (nextSortDirection: SearchSortDirection) => {
    void navigateToSearch({
      sortBy: search.sortBy,
      sortDirection: nextSortDirection,
      nextFilters: filters,
      page: 1,
    });
  };

  const onToggleFilter = (input: ProductFilter) => {
    void navigateToSearch({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      nextFilters: toggleFilter(filters, input),
      page: 1,
    });
  };

  const onApplyPriceRange = (min: string, max: string) => {
    void navigateToSearch({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      nextFilters: applyPriceRangeFilter({
        filters,
        min,
        max,
      }),
      page: 1,
    });
  };

  const onPageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === search.page) {
      return;
    }

    let nextCursor: string | undefined;
    startPageJump(async () => {
      nextCursor =
        nextPage > 1
          ? await searchQueries.resolveCursorForPage({
              page: nextPage,
              query: search.q,
              sortBy: search.sortBy,
              sortDirection: search.sortDirection,
              filters,
            })
          : undefined;
    });

    if (nextPage > 1 && nextCursor === undefined) {
      return;
    }

    await navigateToSearch({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      nextFilters: filters,
      page: nextPage,
      cursor: nextCursor,
    });
  };

  return {
    search,
    filters,
    data,
    totalPages,
    activePage,
    pageJumpLoading,
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
    onPageChange,
  };
}

export const { Store: SearchPageStore, useStore: useSearchPageStore } =
  createStore(useInternalStore);
