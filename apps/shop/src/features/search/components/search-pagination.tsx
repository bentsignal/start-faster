import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";

import { useSearchProducts } from "~/features/search/hooks/use-search-products";

export function SearchPagination() {
  const { hasNextPage, canLoadMore, isFetchingNextPage, fetchNextPage } =
    useSearchProducts();

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
