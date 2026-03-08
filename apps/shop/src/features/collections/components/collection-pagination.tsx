import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";

import { useCollectionPageStore } from "~/features/collections/stores/collection-page-store";

export function CollectionPagination() {
  const hasNextPage = useCollectionPageStore((store) => store.hasNextPage);
  const canLoadMore = useCollectionPageStore((store) => store.canLoadMore);
  const isFetchingNextPage = useCollectionPageStore(
    (store) => store.isFetchingNextPage,
  );
  const fetchNextPage = useCollectionPageStore((store) => store.fetchNextPage);

  return (
    <div className="flex min-h-12 justify-center">
      <div className="flex items-center">
        {hasNextPage ? (
          <Button
            variant="outline"
            onClick={() => {
              void fetchNextPage();
            }}
            disabled={!canLoadMore}
            className="min-w-32"
          >
            {isFetchingNextPage ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              "Load more"
            )}
          </Button>
        ) : (
          <div aria-hidden className="h-9 min-w-32" />
        )}
      </div>
    </div>
  );
}
