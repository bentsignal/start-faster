import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";

export function LoadMorePagination({
  hasNextPage,
  canLoadMore,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  canLoadMore: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  if (!hasNextPage) {
    return null;
  }

  return (
    <div className="flex min-h-12 justify-center">
      <div className="flex items-center">
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
