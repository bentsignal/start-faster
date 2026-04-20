import { useEffect } from "react";

/**
 * Fires `loadMore` when the document has been scrolled within `thresholdPx` of
 * the bottom of the viewport. Also checks on every render that flips
 * `canLoadMore` to true, so lists that don't yet fill the viewport still load
 * their next page.
 */
export function useLoadMoreOnWindowScroll({
  canLoadMore,
  loadMore,
  pageSize,
  thresholdPx = 400,
}: {
  canLoadMore: boolean;
  loadMore: (numItems: number) => void;
  pageSize: number;
  thresholdPx?: number;
}) {
  // eslint-disable-next-line no-restricted-syntax -- manages window scroll listener lifecycle (browser API)
  useEffect(() => {
    if (!canLoadMore) return;

    const check = () => {
      const distanceFromBottom =
        document.documentElement.scrollHeight -
        window.scrollY -
        window.innerHeight;
      if (distanceFromBottom <= thresholdPx) {
        loadMore(pageSize);
      }
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
    };
  }, [canLoadMore, loadMore, pageSize, thresholdPx]);
}
