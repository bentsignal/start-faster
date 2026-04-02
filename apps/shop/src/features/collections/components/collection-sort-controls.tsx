import { useSearch } from "@tanstack/react-router";

import { useCollectionFilterActions } from "~/features/collections/hooks/use-collection-filter-actions";
import { SortSelect } from "~/features/shared/filters/components/sort-select";

export function CollectionSortByControl({
  className,
  disabled = false,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const sortBy = useSearch({
    from: "/collections/$handle",
    select: (search) => search.sortBy,
  });
  const { onSortByChange, isFiltering } = useCollectionFilterActions();

  return (
    <SortSelect
      value={sortBy}
      disabled={disabled || isFiltering}
      className={className}
      options={[
        { value: "relevance", label: "Featured" },
        { value: "price", label: "Price" },
      ]}
      ariaLabel="Sort by"
      onChange={onSortByChange}
    />
  );
}

export function CollectionSortDirectionControl({
  className,
  disabled = false,
}: {
  className?: string;
  disabled?: boolean;
}) {
  const sortDirection = useSearch({
    from: "/collections/$handle",
    select: (search) => search.sortDirection,
  });
  const { onSortDirectionChange, isFiltering } = useCollectionFilterActions();

  return (
    <SortSelect
      value={sortDirection}
      disabled={disabled || isFiltering}
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
