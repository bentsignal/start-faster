import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";

import { useSearchPageStore } from "~/features/search/stores/search-page-store";

export function SearchPagination() {
  const hasNextPage = useSearchPageStore((store) => store.hasNextPage);
  const canLoadMore = useSearchPageStore((store) => store.canLoadMore);
  const isFetchingNextPage = useSearchPageStore(
    (store) => store.isFetchingNextPage,
  );
  const fetchNextPage = useSearchPageStore((store) => store.fetchNextPage);
  if (!hasNextPage) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-3">
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
      </div>
    </div>
  );
}
