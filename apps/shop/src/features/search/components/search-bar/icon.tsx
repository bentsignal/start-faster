import { Search } from "lucide-react";

import { cn } from "@acme/ui/utils";

import { useSearchBarStore } from "../../stores/search-bar-store";

export function SearchIcon({ className }: { className?: string }) {
  const performSearch = useSearchBarStore((s) => s.performSearch);
  const canSearch = useSearchBarStore((s) => s.searchTerm.trim().length > 0);
  return (
    <button
      type="button"
      aria-label="Search"
      className={cn(
        "text-sidebar-foreground size-4",
        canSearch ? "cursor-pointer" : "cursor-not-allowed",
        className,
      )}
      onClick={performSearch}
      disabled={!canSearch}
    >
      <Search className={cn("text-sidebar-foreground size-4", className)} />
    </button>
  );
}
