import type {
  SortBy,
  SortDirection,
} from "~/features/shared/filters/sort-schemas";
import { SortSelect } from "~/features/shared/filters/components/sort-select";

export function SortByControl({
  sortBy,
  onSortByChange,
  className,
  disabled = false,
}: {
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <SortSelect
      value={sortBy}
      disabled={disabled}
      className={className}
      options={[
        { value: "relevance", label: "Relevance" },
        { value: "price", label: "Price" },
      ]}
      ariaLabel="Sort by"
      onChange={onSortByChange}
    />
  );
}

export function SortDirectionControl({
  sortDirection,
  onSortDirectionChange,
  className,
  disabled = false,
}: {
  sortDirection: SortDirection;
  onSortDirectionChange: (value: SortDirection) => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <SortSelect
      value={sortDirection}
      disabled={disabled}
      className={className}
      options={[
        { value: "asc", label: "Low to high" },
        { value: "desc", label: "High to low" },
      ]}
      ariaLabel="Sort direction"
      onChange={onSortDirectionChange}
    />
  );
}
