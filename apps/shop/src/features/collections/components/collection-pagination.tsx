import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { useCollectionPageStore } from "~/features/collections/stores/collection-page-store";

export function CollectionPagination() {
  const activePage = useCollectionPageStore((store) => store.activePage);
  const isFiltering = useCollectionPageStore((store) => store.isFiltering);
  const onPageChange = useCollectionPageStore((store) => store.onPageChange);
  const hasNextPage = useCollectionPageStore((store) => store.hasNextPage);
  const isAtFirstPage = activePage <= 1;
  const isAtLastPage = hasNextPage === false;
  const isBusy = isFiltering;

  const shouldHidePagination = isAtFirstPage && isAtLastPage;
  if (shouldHidePagination) {
    return null;
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        disabled={isAtFirstPage || isBusy}
        className={cn((isAtFirstPage || isBusy) && "opacity-50")}
        render={(props) => (
          <button
            type="button"
            {...props}
            disabled={isAtFirstPage || isBusy}
            onClick={(event) => {
              props.onClick?.(event);
              if (isAtFirstPage || isBusy) {
                return;
              }
              void onPageChange(activePage - 1);
            }}
          >
            Prev
          </button>
        )}
      >
        Prev
      </Button>

      <Button variant="outline" size="sm" disabled>
        Page {activePage}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={isAtLastPage || isBusy}
        className={cn((isAtLastPage || isBusy) && "opacity-50")}
        render={(props) => (
          <button
            type="button"
            {...props}
            disabled={isAtLastPage || isBusy}
            onClick={(event) => {
              props.onClick?.(event);
              if (isAtLastPage || isBusy) {
                return;
              }
              void onPageChange(activePage + 1);
            }}
          >
            Next
          </button>
        )}
      >
        Next
      </Button>
    </nav>
  );
}
