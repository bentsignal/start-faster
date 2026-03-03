import { Button } from "@acme/ui/button";

import { getPageWindow } from "~/features/search/lib/search-pagination";
import { useSearchPageStore } from "~/features/search/stores/search-page-store";

export function SearchPagination() {
  const activePage = useSearchPageStore((store) => store.activePage);
  const totalPages = useSearchPageStore((store) => store.totalPages);
  const loading = useSearchPageStore((store) => store.pageJumpLoading);
  const onPageChange = useSearchPageStore((store) => store.onPageChange);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        disabled={activePage <= 1 || loading}
        onClick={() => {
          void onPageChange(activePage - 1);
        }}
      >
        Prev
      </Button>

      {getPageWindow(activePage, totalPages, 5).map((page) => (
        <Button
          key={page}
          variant={page === activePage ? "default" : "ghost"}
          size="sm"
          disabled={loading}
          onClick={() => {
            void onPageChange(page);
          }}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="sm"
        disabled={activePage >= totalPages || loading}
        onClick={() => {
          void onPageChange(activePage + 1);
        }}
      >
        Next
      </Button>
    </nav>
  );
}
