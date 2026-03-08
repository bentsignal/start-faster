import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod/v4";

import { CollectionFilters } from "~/features/collections/components/collection-filters";
import { CollectionHeroImage } from "~/features/collections/components/collection-hero-image";
import { CollectionPagination } from "~/features/collections/components/collection-pagination";
import { CollectionProductResultsView } from "~/features/collections/components/collection-product-results-view";
import { CollectionResultsHeader } from "~/features/collections/components/collection-results-header";
import { sanitizeCollectionFilters } from "~/features/collections/lib/collection-filter-utils";
import {
  COLLECTION_PAGE_SIZE,
  collectionQueries,
} from "~/features/collections/lib/collection-queries";
import { CollectionPageStore } from "~/features/collections/stores/collection-page-store";

export const Route = createFileRoute("/collections/$handle")({
  params: z.object({
    handle: z.string(),
  }),
  validateSearch: z.object({
    sortBy: z.enum(["relevance", "price"]).default("relevance"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
    filters: z
      .unknown()
      .optional()
      .default([])
      .transform((value) => sanitizeCollectionFilters(value)),
  }),
  loaderDeps: ({ search }) => ({
    sortBy: search.sortBy,
    sortDirection: search.sortDirection,
    filters: search.filters,
  }),
  loader: async ({ context, deps, params }) => {
    const queryClient = context.queryClient;
    const { sortBy, sortDirection, filters } = deps;
    const collectionData = await queryClient.ensureInfiniteQueryData(
      collectionQueries.productsInfinite({
        handle: params.handle,
        sortBy,
        sortDirection,
        filters,
        first: COLLECTION_PAGE_SIZE,
      }),
    );
    const collection = collectionData.pages[0];

    if (collection === null || collection === undefined) {
      throw notFound();
    }
  },
  component: CollectionPage,
});

function CollectionPage() {
  return (
    <CollectionPageStore>
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-4 sm:px-8 sm:py-6 lg:py-14 xl:px-16">
        <CollectionResultsHeader />

        <section className="space-y-8 lg:hidden">
          <CollectionHeroImage />
          <CollectionProductResultsView />
          <CollectionPagination />
        </section>

        <div className="hidden lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
          <CollectionHeroImage className="lg:col-start-2 lg:pb-14" />

          <CollectionFilters />

          <section className="space-y-8 lg:col-start-2">
            <CollectionProductResultsView />
            <CollectionPagination />
          </section>
        </div>
      </main>
    </CollectionPageStore>
  );
}
