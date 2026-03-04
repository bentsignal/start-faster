import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { Link } from "~/components/link";
import { getPageWindow } from "~/features/search/lib/search-pagination";
import { useSearchPageStore } from "~/features/search/stores/search-page-store";

export function SearchPagination() {
  const activePage = useSearchPageStore((store) => store.activePage);
  const totalPages = useSearchPageStore((store) => store.totalPages);
  const isFiltering = useSearchPageStore((store) => store.isFiltering);
  const onPageChange = useSearchPageStore((store) => store.onPageChange);
  const search = useSearchPageStore((store) => store.search);
  const isAtFirstPage = activePage <= 1;
  const isAtLastPage = activePage >= totalPages;
  const isBusy = isFiltering;

  const getSearchForPage = (page: number) => ({
    q: search.q,
    sortBy: search.sortBy,
    sortDirection: search.sortDirection,
    filters: search.filters,
    page,
    cursor: undefined,
  });

  if (totalPages <= 1) {
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
            to="/search"
            search={getSearchForPage(activePage - 1)}
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

      {getPageWindow(activePage, totalPages, 5).map((page) => (
        <Button
          key={page}
          variant={page === activePage ? "default" : "ghost"}
          size="sm"
          disabled={isBusy || page === activePage}
          render={(props) => (
            <Link
              to="/search"
              search={getSearchForPage(page)}
              preload="intent"
              {...props}
              onClick={(event) => {
                event.preventDefault();
                if (isBusy || page === activePage) {
                  return;
                }
                void onPageChange(page);
              }}
            >
              {page}
            </Link>
          )}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        disabled={isAtLastPage || isBusy}
        className={cn((isAtLastPage || isBusy) && "opacity-50")}
        render={(props) => (
          <Link
            to="/search"
            search={getSearchForPage(activePage + 1)}
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
