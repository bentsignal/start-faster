import { useState } from "react";
import { useSearch } from "@tanstack/react-router";

import { useSearchFilterActions } from "~/features/search/hooks/use-search-filter-actions";
import { useSearchProducts } from "~/features/search/hooks/use-search-products";

export function useSearchResultsHeader() {
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = useSearch({ from: "/search", select: (s) => s.q });
  const sortBy = useSearch({ from: "/search", select: (s) => s.sortBy });
  const sortDirection = useSearch({
    from: "/search",
    select: (s) => s.sortDirection,
  });
  const selectedFilters = useSearch({
    from: "/search",
    select: (s) => s.filters,
  });
  const { totalCount } = useSearchProducts();
  const { onSortByChange, onSortDirectionChange, isFiltering } =
    useSearchFilterActions();
  const activeFilterCount = selectedFilters.length;

  return {
    sortOpen,
    setSortOpen,
    filtersOpen,
    setFiltersOpen,
    query,
    sortBy,
    sortDirection,
    totalCount,
    onSortByChange,
    onSortDirectionChange,
    isFiltering,
    activeFilterCount,
  };
}
