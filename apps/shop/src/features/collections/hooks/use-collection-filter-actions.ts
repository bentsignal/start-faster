import {
  useNavigate,
  useParams,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";

import type { ProductFilter } from "@acme/shopify/storefront/types";

import type {
  SortBy,
  SortDirection,
} from "~/features/shared/filters/sort-schemas";
import {
  applyPriceRangeFilter,
  toggleFilter,
} from "~/features/shared/filters/filter-utils";

function navigateToCollection({
  navigate,
  handle,
  sortBy,
  sortDirection,
  filters,
}: {
  navigate: (opts: {
    to: "/collections/$handle";
    params: { handle: string };
    search: {
      sortBy: SortBy;
      sortDirection: SortDirection;
      filters: ProductFilter[];
    };
  }) => Promise<void>;
  handle: string;
  sortBy: SortBy;
  sortDirection: SortDirection;
  filters: ProductFilter[];
}) {
  return navigate({
    to: "/collections/$handle",
    params: { handle },
    search: { sortBy, sortDirection, filters },
  });
}

export function useCollectionFilterActions() {
  const navigate = useNavigate({ from: "/collections/$handle" });
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

  const isFiltering = useRouterState({ select: (s) => s.isLoading });

  const onSortByChange = (nextSortBy: SortBy) =>
    navigateToCollection({
      navigate,
      handle,
      sortBy: nextSortBy,
      sortDirection: searchState.sortDirection,
      filters: searchState.urlFilters,
    });

  const onSortDirectionChange = (nextSortDirection: SortDirection) =>
    navigateToCollection({
      navigate,
      handle,
      sortBy: searchState.sortBy,
      sortDirection: nextSortDirection,
      filters: searchState.urlFilters,
    });

  const onToggleFilter = (input: ProductFilter) =>
    navigateToCollection({
      navigate,
      handle,
      sortBy: searchState.sortBy,
      sortDirection: searchState.sortDirection,
      filters: toggleFilter(searchState.urlFilters, input),
    });

  const onApplyPriceRange = (min: string, max: string) =>
    navigateToCollection({
      navigate,
      handle,
      sortBy: searchState.sortBy,
      sortDirection: searchState.sortDirection,
      filters: applyPriceRangeFilter({
        filters: searchState.urlFilters,
        min,
        max,
      }),
    });

  return {
    isFiltering,
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
  };
}
