import { ChevronDown } from "lucide-react";

import type {
  SearchSortBy,
  SearchSortDirection,
} from "~/features/search/lib/search-queries";
import { useSearchPageStore } from "~/features/search/stores/search-page-store";

export function SearchResultsHeader() {
  const query = useSearchPageStore((store) => store.search.q);
  const totalCount = useSearchPageStore((store) => store.data.totalCount);
  const sortBy = useSearchPageStore((store) => store.search.sortBy);
  const sortDirection = useSearchPageStore(
    (store) => store.search.sortDirection,
  );
  const onSortByChange = useSearchPageStore((store) => store.onSortByChange);
  const onSortDirectionChange = useSearchPageStore(
    (store) => store.onSortDirectionChange,
  );

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-muted-foreground text-sm">
          {totalCount} {totalCount === 1 ? "result" : "results"} for{" "}
          <span className="text-foreground font-medium">"{query}"</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          Sort by
        </span>
        <div className="relative">
          <select
            value={sortBy}
            className="text-foreground h-8 cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium focus:outline-none"
            onChange={(event) => {
              onSortByChange(event.target.value as SearchSortBy);
            }}
          >
            <option value="relevance">Relevance</option>
            <option value="price">Price</option>
          </select>
          <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2" />
        </div>

        <span className="bg-border h-4 w-px" />

        <div className="relative">
          <select
            value={sortDirection}
            className="text-foreground h-8 cursor-pointer appearance-none bg-transparent pr-6 text-sm font-medium focus:outline-none"
            onChange={(event) => {
              onSortDirectionChange(event.target.value as SearchSortDirection);
            }}
          >
            <option value="asc">Low to high</option>
            <option value="desc">High to low</option>
          </select>
          <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-0 size-3.5 -translate-y-1/2" />
        </div>
      </div>
    </header>
  );
}
