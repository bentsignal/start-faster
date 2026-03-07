import { useSearch } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import { cn } from "@acme/ui/utils";

import { useCollectionPageStore } from "~/features/collections/stores/collection-page-store";

function SortSelect<TValue extends string>({
  value,
  onChange,
  className,
  disabled,
  options,
}: {
  value: TValue;
  onChange: (value: TValue) => void;
  className?: string;
  disabled: boolean;
  options: { value: TValue; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        className={cn(
          "text-foreground h-8 w-full cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium focus:outline-none disabled:cursor-not-allowed",
          className,
        )}
        onChange={(event) => {
          onChange(event.target.value as TValue);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2" />
    </div>
  );
}

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
  const onSortByChange = useCollectionPageStore(
    (store) => store.onSortByChange,
  );
  const isFiltering = useCollectionPageStore((store) => store.isFiltering);

  return (
    <SortSelect
      value={sortBy}
      disabled={disabled || isFiltering}
      className={className}
      options={[
        { value: "relevance", label: "Featured" },
        { value: "price", label: "Price" },
      ]}
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
  const sortBy = useSearch({
    from: "/collections/$handle",
    select: (search) => search.sortBy,
  });
  const sortDirection = useSearch({
    from: "/collections/$handle",
    select: (search) => search.sortDirection,
  });
  const onSortDirectionChange = useCollectionPageStore(
    (store) => store.onSortDirectionChange,
  );
  const isFiltering = useCollectionPageStore((store) => store.isFiltering);

  return (
    <SortSelect
      value={sortDirection}
      disabled={disabled || isFiltering || sortBy === "relevance"}
      className={className}
      options={[
        { value: "asc", label: "Low to high" },
        { value: "desc", label: "High to low" },
      ]}
      onChange={onSortDirectionChange}
    />
  );
}
