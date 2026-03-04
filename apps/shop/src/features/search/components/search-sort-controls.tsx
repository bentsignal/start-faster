import { ChevronDown } from "lucide-react";

import { cn } from "@acme/ui/utils";

import type {
  SearchSortBy,
  SearchSortDirection,
} from "~/features/search/lib/search-queries";

export function SortByControl({
  sortBy,
  onSortByChange,
  className,
  disabled = false,
}: {
  sortBy: SearchSortBy;
  onSortByChange: (value: SearchSortBy) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={sortBy}
        disabled={disabled}
        className={cn(
          "text-foreground h-8 w-full cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium focus:outline-none disabled:cursor-not-allowed",
          className,
        )}
        onChange={(event) => {
          onSortByChange(event.target.value as SearchSortBy);
        }}
      >
        <option value="relevance">Relevance</option>
        <option value="price">Price</option>
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2" />
    </div>
  );
}

export function SortDirectionControl({
  sortDirection,
  onSortDirectionChange,
  className,
  disabled = false,
}: {
  sortDirection: SearchSortDirection;
  onSortDirectionChange: (value: SearchSortDirection) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={sortDirection}
        disabled={disabled}
        className={cn(
          "text-foreground h-8 w-full cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium focus:outline-none disabled:cursor-not-allowed",
          className,
        )}
        onChange={(event) => {
          onSortDirectionChange(event.target.value as SearchSortDirection);
        }}
      >
        <option value="asc">Low to high</option>
        <option value="desc">High to low</option>
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2" />
    </div>
  );
}
