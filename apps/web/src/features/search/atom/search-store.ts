import { useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { createStore } from "rostra";

import useDebouncedInput from "~/hooks/use-debounced-input";

function useInternalStore({
  debounceTime = 500,
  initialSearchTerm,
  storeSearchTermInURL = false,
}: {
  debounceTime?: number;
  initialSearchTerm?: string;
  storeSearchTermInURL?: boolean;
}) {
  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue: debouncedSearchTerm,
  } = useDebouncedInput({
    time: debounceTime,
    initialValue: initialSearchTerm,
  });

  const navigate = useNavigate();
  const urlSearchTerm = useSearch({
    from: "/_tabs/search",
    select: (s) => s.q,
  });

  useEffect(() => {
    if (!storeSearchTermInURL) return;
    if (urlSearchTerm === debouncedSearchTerm) return;

    const newSearch = debouncedSearchTerm ? { q: debouncedSearchTerm } : {};
    void navigate({
      to: ".",
      search: newSearch,
      replace: true,
    });
  }, [debouncedSearchTerm, storeSearchTermInURL, navigate, urlSearchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
  };
}

export const { Store, useStore } = createStore(useInternalStore);
