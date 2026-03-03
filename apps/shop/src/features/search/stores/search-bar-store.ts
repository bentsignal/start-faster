import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { createStore } from "rostra";

import useDebouncedInput from "~/hooks/use-debounced-input";

function useInternalStore({
  debounceTime = 250,
  initialSearchTerm,
}: {
  debounceTime?: number;
  initialSearchTerm?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue: debouncedSearchTerm,
  } = useDebouncedInput({
    time: debounceTime,
    initialValue: initialSearchTerm,
  });
  const [isPredictiveOpen, setIsPredictiveOpen] = useState(false);

  function focusInput() {
    if (inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }

  function performSearch() {
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
