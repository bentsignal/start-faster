import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
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
  MAX_COLLECTION_PAGE,
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
    page: z.coerce.number().int().min(1).default(1),
    cursor: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({
    sortBy: search.sortBy,
    sortDirection: search.sortDirection,
    filters: search.filters,
    page: search.page,
    cursor: search.cursor,
  }),
  loader: async ({ context, deps, params }) => {
    const queryClient = context.queryClient;
    const { sortBy, sortDirection, filters, page, cursor } = deps;
    if (page > MAX_COLLECTION_PAGE) {
      throw redirect({
        to: "/collections/$handle",
        params: { handle: params.handle },
        search: {
          sortBy,
          sortDirection,
          filters,
          page: MAX_COLLECTION_PAGE,
          cursor: undefined,
        },
      });
    }

    const hasCursorInSearch = cursor !== undefined;
    let newCursor = cursor;

    if (page === 1) {
      newCursor = undefined;
    }

    if (page > 1 && newCursor === undefined) {
      newCursor = await collectionQueries.resolveCursorForPage({
        queryClient,
        page,
        handle: params.handle,
        sortBy,
        sortDirection,
        filters,
      });
    }

    if (page > 1 && newCursor === undefined) {
      throw redirect({
        to: "/collections/$handle",
        params: { handle: params.handle },
        search: {
          sortBy,
          sortDirection,
          filters,
          page: 1,
        },
      });
    }

    if (page > 1 && hasCursorInSearch === false && newCursor !== undefined) {
      throw redirect({
        to: "/collections/$handle",
        params: { handle: params.handle },
        search: {
          sortBy,
          sortDirection,
          filters,
          page,
          cursor: newCursor,
        },
      });
    }

    const collection = await queryClient.ensureQueryData(
      collectionQueries.productsPage({
        handle: params.handle,
        sortBy,
        sortDirection,
        filters,
        first: COLLECTION_PAGE_SIZE,
        after: newCursor,
      }),
    );

    if (collection === null || collection === undefined) {
      throw notFound();
    }
  },
  component: CollectionPage,
});

function CollectionPage() {
  return (
    <CollectionPageStore>
      <main className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-4 sm:px-8 sm:py-6 xl:px-16">
        <CollectionResultsHeader />

        <section className="space-y-8 lg:hidden">
          <CollectionHeroImage />
          <CollectionProductResultsView />
          <CollectionPagination />
        </section>

        <div className="hidden lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-0">
          <div />
          <div className="pb-8">
            <CollectionHeroImage />
          </div>

          <CollectionFilters />

          <section className="space-y-8">
            <CollectionProductResultsView />
            <CollectionPagination />
          </section>
        </div>
      </main>
    </CollectionPageStore>
  );
}
