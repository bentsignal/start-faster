import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useParams, useRouterState, useSearch } from "@tanstack/react-router";

import {
  COLLECTION_PAGE_SIZE,
  collectionQueries,
} from "~/features/collections/lib/collection-queries";
import { SearchResultProductCard } from "~/features/search/components/product-results/search-result-product-card";

function useCollectionProductsList() {
  const handle = useParams({
    from: "/collections/$handle",
    select: (params) => params.handle,
  });
  const searchState = useSearch({
    from: "/collections/$handle",
    select: (search) => ({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      urlFilters: search.filters,
    }),
  });

  const { data } = useSuspenseInfiniteQuery({
    ...collectionQueries.productsInfinite({
      handle,
      sortBy: searchState.sortBy,
      sortDirection: searchState.sortDirection,
      filters: searchState.urlFilters,
      first: COLLECTION_PAGE_SIZE,
    }),
    refetchOnMount: false,
    select: (queryData) =>
      queryData.pages.flatMap((page) => page?.products.nodes ?? []),
  });

  return data;
}

export function CollectionProductResultsView() {
  const products = useCollectionProductsList();
  const isFiltering = useRouterState({ select: (s) => s.isLoading });

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground py-10 pt-8 text-center sm:h-[calc(100vh-20rem)] sm:py-16">
          No products found in this collection.
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
            imageLoading={index === 0 ? "eager" : "lazy"}
            imageFetchPriority={index === 0 ? "high" : "auto"}
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
            imageLoading={index === 0 ? "eager" : "lazy"}
            imageFetchPriority={index === 0 ? "high" : "auto"}
          />
        ))}
      </div>
    </div>
  );
}
