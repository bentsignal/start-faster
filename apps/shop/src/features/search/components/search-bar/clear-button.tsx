import { X } from "lucide-react";

import { cn } from "@acme/ui/utils";

import { useSearchBarStore } from "~/features/search/stores/search-bar-store";

export function SearchClearButton({ className }: { className?: string }) {
  const setSearchTerm = useSearchBarStore((s) => s.setSearchTerm);
  const hideButton = useSearchBarStore((s) => s.searchTerm.length === 0);
  const focusInput = useSearchBarStore((s) => s.focusInput);

  if (hideButton) return null;

  function handleClick() {
    setSearchTerm("");
    focusInput();
  }

  return (
    <button
      type="button"
      aria-label="Clear search"
      className={cn(
        "text-sidebar-foreground cursor-pointer py-2 pl-2",
        className,
      )}
      onClick={handleClick}
    >
      <X className="size-4" />
    </button>
  );
}
