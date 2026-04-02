import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useParams, useSearch } from "@tanstack/react-router";

import { QuickLink } from "@acme/features/quick-link";

import { Image } from "~/components/image";
import {
  COLLECTION_PAGE_SIZE,
  collectionQueries,
} from "~/features/collections/lib/collection-queries";

function useCollectionImage() {
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
    select: (queryData) => {
      const collection = queryData.pages[0];
      return {
        image: collection?.image ?? null,
        handle: collection?.handle ?? null,
        title: collection?.title ?? "Collection",
      };
    },
  });

  return data;
}

export function CollectionHeroImage({ className }: { className?: string }) {
  const { image, handle } = useCollectionImage();

  if (image === null) {
    return null;
  }

  return (
    <div className={className}>
      {handle ? (
        <QuickLink
          to="/collections/$handle"
          params={{ handle }}
          className="block"
        >
          <CollectionHeroImageContent />
        </QuickLink>
      ) : (
        <CollectionHeroImageContent />
      )}
    </div>
  );
}

function CollectionHeroImageContent() {
  const { image, title } = useCollectionImage();

  if (image === null) {
    return null;
  }

  return (
    <Image
      src={image.url}
      alt={image.altText ?? `${title} collection`}
      width={image.width ?? 1400}
      height={image.height ?? 560}
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className="bg-muted w-full rounded-xl object-cover"
    />
  );
}
