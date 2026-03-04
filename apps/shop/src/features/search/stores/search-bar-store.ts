import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { createStore } from "rostra";

import useDebouncedInput from "~/hooks/use-debounced-input";

function useInternalStore({
  debounceTime = 500,
  initialSearchTerm,
}: {
  debounceTime?: number;
  initialSearchTerm?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const router = useRouter();
  const lastPrefetchedQueryRef = useRef<string | null>(null);

  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue: debouncedSearchTerm,
  } = useDebouncedInput({
    time: debounceTime,
    initialValue: initialSearchTerm,
  });
  const [isPredictiveOpen, setIsPredictiveOpen] = useState(false);

  useEffect(() => {
    const trimmedQuery = debouncedSearchTerm.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    if (lastPrefetchedQueryRef.current === trimmedQuery) {
      return;
    }

    lastPrefetchedQueryRef.current = trimmedQuery;

    void router
      .preloadRoute({
        to: "/search",
        search: {
          q: trimmedQuery,
          sortBy: "relevance",
          sortDirection: "desc",
          filters: [],
          page: 1,
        },
      })
      .catch((error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown preload error";
        console.error("Failed to preload /search route", {
          query: trimmedQuery,
          errorMessage,
        });
        lastPrefetchedQueryRef.current = null;
      });
  }, [debouncedSearchTerm, router]);

  function focusInput() {
    if (inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }

  function performSearch() {
    inputRef.current?.blur();
    void navigate({
      to: "/search",
      search: {
        q: searchTerm.trim(),
        sortBy: "relevance",
        sortDirection: "desc",
        filters: [],
        page: 1,
      },
    });
    setIsPredictiveOpen(false);
  }

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    isPredictiveOpen,
    setIsPredictiveOpen,
    focusInput,
    inputRef,
    performSearch,
  };
}

export const { Store: SearchBarStore, useStore: useSearchBarStore } =
  createStore(useInternalStore);
