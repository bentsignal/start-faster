import type { InputHTMLAttributes } from "react";

import { cn } from "@acme/ui/utils";

import { useSearchBarStore } from "~/features/search/stores/search-bar-store";

export function SearchInput({
  className,
  onBlur,
  onFocus,
  onKeyDown,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const searchTerm = useSearchBarStore((s) => s.searchTerm);
  const setSearchTerm = useSearchBarStore((s) => s.setSearchTerm);
  const inputRef = useSearchBarStore((s) => s.inputRef);
  const setIsPredictiveOpen = useSearchBarStore((s) => s.setIsPredictiveOpen);
  const performSearch = useSearchBarStore((s) => s.performSearch);

  return (
    <input
      ref={inputRef}
      className={cn(
        "text-sidebar-foreground placeholder:text-muted-foreground h-10 flex-1 bg-transparent px-4 outline-none",
        className,
      )}
      value={searchTerm}
      autoCorrect="off"
      autoCapitalize="off"
      autoComplete="off"
      placeholder="Search"
      onChange={(e) => setSearchTerm(e.target.value)}
      onFocus={(event) => {
        setIsPredictiveOpen(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        window.setTimeout(() => {
          setIsPredictiveOpen(false);
        }, 80);
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsPredictiveOpen(false);
        }

        if (event.key === "Enter") {
          event.preventDefault();
          performSearch();
        }

        onKeyDown?.(event);
      }}
      {...props}
    />
  );
}
