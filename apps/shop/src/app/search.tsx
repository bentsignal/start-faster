import { createFileRoute } from "@tanstack/react-router";

import { SearchProductResultsView } from "~/features/search/components/product-results/search-product-results-view";
import { SearchFilters } from "~/features/search/components/search-filters";
import { SearchPagination } from "~/features/search/components/search-pagination";
import { SearchResultsHeader } from "~/features/search/components/search-results-header";
import {
  loadSearchPageData,
  searchRouteSchema,
} from "~/features/search/lib/search-route";
import { SearchPageStore } from "~/features/search/stores/search-page-store";

export const Route = createFileRoute("/search")({
  validateSearch: searchRouteSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await loadSearchPageData({
      queryClient: context.queryClient,
      search: deps,
    });
  },
  component: SearchPage,
});

function SearchPage() {
  const search = Route.useSearch();

  return (
    <SearchPageStore search={search}>
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-10 sm:px-8 xl:px-16">
        <SearchResultsHeader />

        <div className="bg-border h-px" />

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-0">
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
