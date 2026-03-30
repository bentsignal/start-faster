import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { SearchProductResultsView } from "~/features/search/components/product-results/search-product-results-view";
import { SearchFilters } from "~/features/search/components/search-filters";
import { SearchPagination } from "~/features/search/components/search-pagination";
import { SearchResultsHeader } from "~/features/search/components/search-results-header";
import { sanitizeProductFilters } from "~/features/search/lib/search-filter-utils";
import {
  SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({
    q: z.string().default(""),
    sortBy: z.enum(["relevance", "price"]).default("relevance"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
    filters: z
      .unknown()
      .optional()
      .default([])
      .transform((value) => sanitizeProductFilters(value)),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    const queryClient = context.queryClient;
    const query = deps.q.trim();
    if (query.length === 0) {
      throw redirect({ to: "/" });
    }

    const filters = deps.filters;
    await queryClient.ensureInfiniteQueryData(
      searchQueries.productsInfinite({
        query,
        sortBy: deps.sortBy,
        sortDirection: deps.sortDirection,
        filters,
        first: SEARCH_PAGE_SIZE,
      }),
    );
  },
  component: SearchPage,
});

function SearchPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-4 sm:px-8 sm:py-6 lg:py-14 xl:px-16">
      <SearchResultsHeader />

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
        <SearchFilters />

        <section className="space-y-8">
          <SearchProductResultsView />
          <SearchPagination />
        </section>
      </div>
    </main>
  );
}
