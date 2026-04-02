import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { SearchResultProductCard } from "~/features/search/components/product-results/search-result-product-card";
import { useSearchFilterLoading } from "~/features/search/hooks/use-search-filter-actions";
import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";

function useSearchProductsList() {
  const search = useSearch({
    from: "/search",
    select: (s) => ({
      q: s.q,
      sortBy: s.sortBy,
      sortDirection: s.sortDirection,
      filters: s.filters,
    }),
  });

  const { data } = useSuspenseInfiniteQuery({
    ...searchQueries.productsInfinite({
      query: search.q,
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      filters: search.filters,
      first: SEARCH_PAGE_SIZE,
    }),
    refetchOnMount: false,
    select: (queryData) =>
      queryData.pages.flatMap((page) =>
        (page?.nodes ?? []).filter((node) => node.__typename === "Product"),
      ),
  });

  return data;
}

export function SearchProductResultsView() {
  const products = useSearchProductsList();
  const { isFiltering } = useSearchFilterLoading();

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground py-10 pt-8 text-center sm:h-[calc(100vh-20rem)] sm:py-16">
          No results found.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <div
        className={`space-y-3 transition-opacity md:hidden ${
          isFiltering ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        {products.map((product, index) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            mode="list"
            imageLoading={index <= 5 ? "eager" : "lazy"}
            imageFetchPriority={index <= 5 ? "high" : "auto"}
          />
        ))}
      </div>
      <div
        className={`hidden grid-cols-2 gap-x-5 gap-y-8 transition-opacity md:grid lg:grid-cols-3 ${
          isFiltering ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        {products.map((product, index) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            mode="grid"
            imageLoading={index <= 6 ? "eager" : "lazy"}
            imageFetchPriority={index <= 6 ? "high" : "auto"}
          />
        ))}
      </div>
    </div>
  );
}
