import { useNavigate, useRouterState, useSearch } from "@tanstack/react-router";

import type { ProductFilter } from "@acme/shopify/storefront/types";

import type {
  SortBy,
  SortDirection,
} from "~/features/shared/filters/sort-schemas";
import {
  applyPriceRangeFilter,
  toggleFilter,
} from "~/features/shared/filters/filter-utils";

// ---------------------------------------------------------------------------
// Read-only hook for loading state (used by components that only render)
// ---------------------------------------------------------------------------

export function useSearchFilterLoading() {
  const isFiltering = useRouterState({ select: (s) => s.isLoading });
  return { isFiltering };
}

// ---------------------------------------------------------------------------
// Action hook (sort / toggle / price)
// ---------------------------------------------------------------------------

type SearchNavigateFn = (opts: {
  to: "/search";
  search: {
    q: string;
    sortBy: SortBy;
    sortDirection: SortDirection;
    filters: ProductFilter[];
  };
}) => Promise<void>;

function buildNavigationActions({
  navigate,
  searchState,
}: {
  navigate: SearchNavigateFn;
  searchState: {
    q: string;
    sortBy: SortBy;
    sortDirection: SortDirection;
    filters: ProductFilter[];
  };
}) {
  const onSortByChange = (nextSortBy: SortBy) =>
    navigate({
      to: "/search",
      search: { ...searchState, sortBy: nextSortBy },
    });

  const onSortDirectionChange = (nextSortDirection: SortDirection) =>
    navigate({
      to: "/search",
      search: { ...searchState, sortDirection: nextSortDirection },
    });

  const onToggleFilter = (input: ProductFilter) =>
    navigate({
      to: "/search",
      search: {
        ...searchState,
        filters: toggleFilter(searchState.filters, input),
      },
    });

  const onApplyPriceRange = (min: string, max: string) =>
    navigate({
      to: "/search",
      search: {
        ...searchState,
        filters: applyPriceRangeFilter({
          filters: searchState.filters,
          min,
          max,
        }),
      },
    });

  return {
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
  };
}

export function useSearchFilterActions() {
  const search = useSearch({
    from: "/search",
    select: (s) => ({
      q: s.q,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
      filters: s.filters,
    }),
  });

  const navigate = useNavigate({ from: "/search" });
  const isFiltering = useRouterState({ select: (s) => s.isLoading });

  const actions = buildNavigationActions({
    navigate,
    searchState: search,
  });

  return {
    ...actions,
    isFiltering,
  };
}
