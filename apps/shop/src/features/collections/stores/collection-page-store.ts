import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { createStore } from "rostra";

import type { ProductFilter } from "@acme/shopify/storefront/types";

import type {
  CollectionSortBy,
  CollectionSortDirection,
} from "~/features/collections/lib/collection-queries";
import {
  applyPriceRangeFilter,
  toggleFilter,
} from "~/features/collections/lib/collection-filter-utils";
import {
  COLLECTION_PAGE_SIZE,
  collectionQueries,
} from "~/features/collections/lib/collection-queries";

function useInternalStore() {
  const navigate = useNavigate({ from: "/collections/$handle" });
  const params = useParams({ from: "/collections/$handle" });
  const { sortBy, sortDirection, urlFilters, page, cursor } = useSearch({
    from: "/collections/$handle",
    select: (search) => ({
      sortBy: search.sortBy,
      sortDirection: search.sortDirection,
      urlFilters: search.filters,
      page: search.page,
      cursor: search.cursor,
    }),
  });
  const [isFilterNavigationLoading, setIsFilterNavigationLoading] =
    useState(false);
  const [isPriceApplyLoading, setIsPriceApplyLoading] = useState(false);

  const { data: collection } = useSuspenseQuery({
    ...collectionQueries.productsPage({
      handle: params.handle,
      sortBy: sortBy,
      sortDirection: sortDirection,
      filters: urlFilters,
      first: COLLECTION_PAGE_SIZE,
      after: page === 1 ? undefined : cursor,
    }),
    refetchOnMount: false,
  });

  const products = collection?.products.nodes ?? [];
  const filters = collection?.products.filters ?? [];

  const activePage = page;
  const hasNextPage = collection?.products.pageInfo.hasNextPage ?? false;

  const runWithLoading = async ({
    setLoading,
    action,
  }: {
    setLoading: (isLoading: boolean) => void;
    action: () => Promise<void>;
  }) => {
    setLoading(true);
    await action().finally(() => {
      setLoading(false);
    });
  };

  const onSortByChange = (nextSortBy: CollectionSortBy) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/collections/$handle",
          params: { handle: params.handle },
          search: {
            sortBy: nextSortBy,
            sortDirection: nextSortBy === "relevance" ? "desc" : sortDirection,
            filters: urlFilters,
            page: 1,
            cursor: undefined,
          },
        }),
    });
  };

  const onSortDirectionChange = (
    nextSortDirection: CollectionSortDirection,
  ) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/collections/$handle",
          params: { handle: params.handle },
          search: {
            sortBy: sortBy,
            sortDirection: nextSortDirection,
            filters: urlFilters,
            page: 1,
            cursor: undefined,
          },
        }),
    });
  };

  const onToggleFilter = (input: ProductFilter) => {
    void runWithLoading({
      setLoading: setIsFilterNavigationLoading,
      action: () =>
        navigate({
          to: "/collections/$handle",
          params: { handle: params.handle },
          search: {
            sortBy: sortBy,
            sortDirection: sortDirection,
            filters: toggleFilter(urlFilters, input),
            page: 1,
            cursor: undefined,
          },
        }),
    });
  };

  const onApplyPriceRange = (min: string, max: string) => {
    void runWithLoading({
      setLoading: setIsPriceApplyLoading,
      action: () =>
        navigate({
          to: "/collections/$handle",
          params: { handle: params.handle },
          search: {
            sortBy: sortBy,
            sortDirection: sortDirection,
            filters: applyPriceRangeFilter({
              filters: urlFilters,
              min,
              max,
            }),
            page: 1,
            cursor: undefined,
          },
        }),
    });
  };

  const onPageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage === activePage) {
      return;
    }

    if (nextPage > activePage && hasNextPage === false) {
      return;
    }

    await navigate({
      to: "/collections/$handle",
      params: { handle: params.handle },
      search: {
        sortBy: sortBy,
        sortDirection: sortDirection,
        filters: urlFilters,
        page: nextPage,
        cursor: undefined,
      },
    });
  };

  const isFiltering = isFilterNavigationLoading || isPriceApplyLoading;

  return {
    collection,
    products,
    filters,
    activePage,
    hasNextPage,
    isFiltering,
    isPriceApplyLoading,
    onSortByChange,
    onSortDirectionChange,
    onToggleFilter,
    onApplyPriceRange,
    onPageChange,
  };
}

export const { Store: CollectionPageStore, useStore: useCollectionPageStore } =
  createStore(useInternalStore);
