import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { createStore } from "rostra";

import { useDebouncedInput } from "~/hooks/use-debounced-input";

function useSearchPrefetch(debouncedSearchTerm: string) {
  const router = useRouter();
  const lastPrefetchedQueryRef = useRef<string | null>(null);

  // eslint-disable-next-line no-restricted-syntax -- syncs debounced search term with router preloading (external system)
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
}

function useSearchBarActions(
  inputRef: React.RefObject<HTMLInputElement | null>,
  searchTerm: string,
  setIsPredictiveOpen: (open: boolean) => void,
) {
  const navigate = useNavigate();

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
      },
    });
    setIsPredictiveOpen(false);
  }

  return { focusInput, performSearch, navigate };
}

function useInternalStore({
  debounceTime = 500,
  initialSearchTerm,
}: {
  debounceTime?: number;
  initialSearchTerm?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    value: searchTerm,
    setValue: setSearchTermInternal,
    debouncedValue: debouncedSearchTerm,
  } = useDebouncedInput({
    time: debounceTime,
    initialValue: initialSearchTerm,
  });
  const [isPredictiveOpenRaw, setIsPredictiveOpenRaw] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [predictiveProducts, setPredictiveProducts] = useState<string[]>([]);

  const isPredictiveOpen = isPredictiveOpenRaw;

  function setSearchTerm(value: string) {
    setSearchTermInternal(value);
    setSelectedIndex(-1);
  }

  function setIsPredictiveOpen(open: boolean) {
    setIsPredictiveOpenRaw(open);
    if (!open) {
      setSelectedIndex(-1);
    }
  }

  useSearchPrefetch(debouncedSearchTerm);
  const { focusInput, performSearch, navigate } = useSearchBarActions(
    inputRef,
    searchTerm,
    setIsPredictiveOpen,
  );

  function navigateResults(direction: "next" | "prev") {
    if (!isPredictiveOpen) return false;
    const totalItems = predictiveProducts.length + 1; // products + "View all results"
    if (totalItems === 0) return false;

    setSelectedIndex((prev) => {
      if (direction === "next") {
        return prev >= totalItems - 1 ? 0 : prev + 1;
      }
      return prev <= 0 ? totalItems - 1 : prev - 1;
    });
    return true;
  }

  function confirmSelection() {
    if (selectedIndex >= 0 && selectedIndex < predictiveProducts.length) {
      const handle = predictiveProducts[selectedIndex];
      if (handle) {
        inputRef.current?.blur();
        void navigate({
          to: "/shop/$handle",
          params: { handle },
        });
        setIsPredictiveOpen(false);
      }
    } else {
      performSearch();
    }
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
    selectedIndex,
    predictiveProducts,
    setPredictiveProducts,
    navigateResults,
    confirmSelection,
  };
}

export const { Store: SearchBarStore, useStore: useSearchBarStore } =
  createStore(useInternalStore);
