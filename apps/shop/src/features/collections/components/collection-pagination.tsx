import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { Link } from "~/components/link";
import { useCollectionPageStore } from "~/features/collections/stores/collection-page-store";

export function CollectionPagination() {
  const activePage = useCollectionPageStore((store) => store.activePage);
  const isFiltering = useCollectionPageStore((store) => store.isFiltering);
  const onPageChange = useCollectionPageStore((store) => store.onPageChange);
  const hasNextPage = useCollectionPageStore((store) => store.hasNextPage);
  const collectionHandle = useCollectionPageStore(
    (store) => store.collection?.handle ?? "",
  );

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
          <Link
            to="/collections/$handle"
            params={{ handle: collectionHandle }}
            search={(prev) => ({
              ...prev,
              page: activePage - 1,
              cursor: undefined,
            })}
            preload="intent"
            {...props}
            disabled={isAtFirstPage || isBusy}
            onClick={(event) => {
              event.preventDefault();
              if (isAtFirstPage || isBusy) {
                return;
              }
              void onPageChange(activePage - 1);
            }}
          >
            Prev
          </Link>
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
          <Link
            to="/collections/$handle"
            params={{ handle: collectionHandle }}
            search={(prev) => ({
              ...prev,
              page: activePage + 1,
              cursor: undefined,
            })}
            preload="intent"
            {...props}
            onClick={(event) => {
              event.preventDefault();
              if (isAtLastPage || isBusy) {
                return;
              }
              void onPageChange(activePage + 1);
            }}
          >
            Next
          </Link>
        )}
      >
        Next
      </Button>
    </nav>
  );
}
