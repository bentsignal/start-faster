import { useState } from "react";
import { useRouterState, useSearch } from "@tanstack/react-router";

export function useCollectionResultsHeader() {
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const selectedFilters = useSearch({
    from: "/collections/$handle",
    select: (search) => search.filters,
  });
  const isFiltering = useRouterState({ select: (s) => s.isLoading });
  const activeFilterCount = selectedFilters.length;

  return {
    sortOpen,
    setSortOpen,
    filtersOpen,
    setFiltersOpen,
    isFiltering,
    activeFilterCount,
  };
}
