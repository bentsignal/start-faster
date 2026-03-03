import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import type { ProductFilter } from "@acme/shopify/storefront/types";

import { SearchProductResultsView } from "~/features/search/components/product-results/search-product-results-view";
import { SearchFilters } from "~/features/search/components/search-filters";
import { SearchPagination } from "~/features/search/components/search-pagination";
import { SearchResultsHeader } from "~/features/search/components/search-results-header";
import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";
import { SearchPageStore } from "~/features/search/stores/search-page-store";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({
    q: z.string().default(""),
    sortBy: z.enum(["relevance", "price"]).default("relevance"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
    filters: z.array(z.custom<ProductFilter>()).default([]),
    page: z.coerce.number().int().min(1).default(1),
    cursor: z.string().optional(),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const queryClient = context.queryClient;
    const query = deps.q.trim();
    if (query.length === 0) {
      throw redirect({ to: "/" });
    }

    const filters = deps.filters;

    let cursor = deps.cursor;

    if (deps.page === 1) {
      cursor = undefined;
    }

    if (deps.page > 1 && cursor === undefined) {
      cursor = await searchQueries.resolveCursorForPage({
        page: deps.page,
        query,
        sortBy: deps.sortBy,
        sortDirection: deps.sortDirection,
        filters,
      });
    }

    if (deps.page > 1 && cursor === undefined) {
      throw redirect({
        to: "/search",
        search: {
          q: query,
          sortBy: deps.sortBy,
          sortDirection: deps.sortDirection,
          filters,
          page: 1,
        },
      });
    }

    await queryClient.ensureQueryData(
      searchQueries.products({
        query,
        sortBy: deps.sortBy,
        sortDirection: deps.sortDirection,
        filters,
        first: SEARCH_PAGE_SIZE,
        after: cursor,
      }),
    );
  },
  component: SearchPage,
});

function SearchPage() {
  return (
    <SearchPageStore>
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-4 sm:px-8 sm:py-6 xl:px-16">
        <SearchResultsHeader />

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
          <SearchFilters />

          <section className="space-y-8">
            <SearchProductResultsView />
            <SearchPagination />
          </section>
        </div>
      </main>
    </SearchPageStore>
  );
}
