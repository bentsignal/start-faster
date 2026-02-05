import { useEffect, useState } from "react";
import { usePaginatedQuery } from "convex/react";

import type { UIProfile } from "@acme/convex/types";
import { api } from "@acme/convex/api";

import * as Search from "../atom";

const PAGE_SIZE = 25;

type SearchResultsStatus =
  | "no-search-term-entered"
  | "no-results-found"
  | "results-found";

function useSearchResults() {
  const searchTerm = Search.useStore((s) => s.searchTerm.trim());
  const debouncedSearchTerm = Search.useStore((s) =>
    s.debouncedSearchTerm.trim(),
  );

  const {
    results: paginatedResults,
    status: loadingStatus,
    loadMore,
  } = usePaginatedQuery(
    api.profile.search,
    debouncedSearchTerm.length > 0
      ? { searchTerm: debouncedSearchTerm }
      : "skip",
    { initialNumItems: PAGE_SIZE },
  );

  const [results, setResults] = useState<UIProfile[]>([]);

  useEffect(() => {
    if (searchTerm.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    if (debouncedSearchTerm.length === 0) return;
    if (loadingStatus === "LoadingFirstPage") return;
    setResults(paginatedResults);
  }, [debouncedSearchTerm, paginatedResults, loadingStatus, searchTerm]);

  const idle = loadingStatus === "CanLoadMore" || loadingStatus === "Exhausted";

  const resultsStatus: SearchResultsStatus =
    searchTerm.length > 0 && paginatedResults.length === 0 && idle
      ? "no-results-found"
      : searchTerm.length === 0
        ? "no-search-term-entered"
        : "results-found";

  const loadMoreItems = () => {
    if (loadingStatus === "CanLoadMore") {
      loadMore(PAGE_SIZE);
    }
  };

  return { results, resultsStatus, loadingStatus, loadMoreItems };
}

export { useSearchResults };
