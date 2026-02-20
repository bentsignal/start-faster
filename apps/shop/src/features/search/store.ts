import { useRef } from "react";
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

  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue: debouncedSearchTerm,
  } = useDebouncedInput({
    time: debounceTime,
    initialValue: initialSearchTerm,
  });

  function focusInput() {
    if (inputRef.current) {
      inputRef.current.focus();
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  }

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    focusInput,
    inputRef,
  };
}

export const { Store: SearchStore, useStore: useSearchStore } =
  createStore(useInternalStore);
