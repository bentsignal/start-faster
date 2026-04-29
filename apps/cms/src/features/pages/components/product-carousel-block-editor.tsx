// eslint-disable-next-line no-restricted-imports -- conditional fetch: only runs when search term is provided
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, Search } from "lucide-react";

import type { ProductCarouselBlock } from "@acme/convex/page-validators";
import type { SearchCollectionsQuery } from "@acme/shopify/storefront/generated";
import { Input } from "@acme/ui/input";

import { Image } from "~/components/image";
import { collectionQueries } from "~/features/pages/lib/collection-queries";
import { useDebouncedInput } from "~/hooks/use-debounced-input";

type CollectionNode = SearchCollectionsQuery["collections"]["nodes"][number];

function useProductCarouselBlockEditor({
  block,
  onChange,
}: {
  block: ProductCarouselBlock;
  onChange: (block: ProductCarouselBlock) => void;
}) {
  const {
    value: searchTerm,
    setValue: setSearchTerm,
    debouncedValue: debouncedSearchTerm,
  } = useDebouncedInput();

  function handleSelect(collection: CollectionNode) {
    onChange({
      ...block,
      data: {
        status: "ready",
        collectionHandle: collection.handle,
        collectionTitle: collection.title,
      },
    });
    setSearchTerm("");
  }

  function handleClear() {
    onChange({ ...block, data: { status: "empty" } });
  }

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    handleSelect,
    handleClear,
  };
}

export function ProductCarouselBlockEditor({
  block,
  onChange,
}: {
  block: ProductCarouselBlock;
  onChange: (block: ProductCarouselBlock) => void;
}) {
  const { searchTerm, setSearchTerm, debouncedSearchTerm, handleSelect } =
    useProductCarouselBlockEditor({ block, onChange });

  return (
    <div className="flex flex-col gap-4 p-4">
      <CollectionSearch
        searchTerm={searchTerm}
        debouncedSearchTerm={debouncedSearchTerm}
        onSearchTermChange={setSearchTerm}
        onSelect={handleSelect}
        selectedHandle={
          block.data.status === "ready" ? block.data.collectionHandle : null
        }
      />
    </div>
  );
}

function CollectionSearch({
  searchTerm,
  debouncedSearchTerm,
  onSearchTermChange,
  onSelect,
  selectedHandle,
}: {
  searchTerm: string;
  debouncedSearchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSelect: (collection: CollectionNode) => void;
  selectedHandle: string | null;
}) {
  const { data: collections, isFetching } = useQuery({
    ...collectionQueries.search(debouncedSearchTerm),
    select: (data) => data?.collections.nodes ?? [],
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted-foreground text-xs font-medium">
        {selectedHandle ? "Switch collection" : "Search collections"}
      </span>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
        <Input
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Search for a collection..."
          className="pl-9"
        />
      </div>

      <CollectionResults
        collections={collections ?? []}
        isFetching={isFetching}
        selectedHandle={selectedHandle}
        onSelect={onSelect}
      />
    </div>
  );
}

function CollectionResults({
  collections,
  isFetching,
  selectedHandle,
  onSelect,
}: {
  collections: CollectionNode[];
  isFetching: boolean;
  selectedHandle: string | null;
  onSelect: (collection: CollectionNode) => void;
}) {
  if (isFetching && collections.length === 0) {
    return <CollectionResultsPlaceholder />;
  }

  if (collections.length === 0) {
    return (
      <p className="text-muted-foreground px-1 py-2 text-sm">
        No collections found
      </p>
    );
  }

  return (
    <div className="flex max-h-64 flex-col gap-1 overflow-auto">
      {collections.map((collection) => (
        <CollectionRow
          key={collection.id}
          collection={collection}
          isSelected={collection.handle === selectedHandle}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function CollectionRow({
  collection,
  isSelected,
  onSelect,
}: {
  collection: CollectionNode;
  isSelected: boolean;
  onSelect: (collection: CollectionNode) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(collection)}
      className={
        isSelected
          ? "border-primary bg-primary/5 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
          : "border-border hover:border-foreground/40 hover:bg-muted/50 flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
      }
    >
      {collection.image?.url ? (
        <Image
          src={collection.image.url}
          alt={collection.image.altText ?? collection.title}
          width={40}
          height={40}
          className="bg-muted size-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="bg-muted size-10 shrink-0 rounded-md" />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium">{collection.title}</span>
        <span className="text-muted-foreground text-xs">
          {collection.handle}
        </span>
      </div>
      {isSelected ? <Check className="text-primary size-4 shrink-0" /> : null}
    </button>
  );
}

function CollectionResultsPlaceholder() {
  return (
    <div className="flex flex-col gap-1" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5"
        >
          <div className="bg-muted size-10 shrink-0 animate-pulse rounded-md" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
            <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
