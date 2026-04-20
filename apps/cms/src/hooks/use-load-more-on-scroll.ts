import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Fires `loadMore` when the scroll container is within `thresholdPx` of the
 * bottom — both on user scroll and any time `canLoadMore` flips to true (which
 * also covers the case where the initial content doesn't fill the viewport).
 */
export function useLoadMoreOnScroll({
  scrollRef,
  canLoadMore,
  loadMore,
  pageSize,
  thresholdPx = 400,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  canLoadMore: boolean;
  loadMore: (numItems: number) => void;
  pageSize: number;
  thresholdPx?: number;
}) {
  // eslint-disable-next-line no-restricted-syntax -- manages scroll listener lifecycle (browser API)
  useEffect(() => {
    if (!canLoadMore) return;

    const node = scrollRef.current;
    if (!node) return;

    const check = () => {
      const distanceFromBottom =
        node.scrollHeight - node.scrollTop - node.clientHeight;
      if (distanceFromBottom <= thresholdPx) {
        loadMore(pageSize);
      }
    };

    check();
    node.addEventListener("scroll", check, { passive: true });
    return () => {
      node.removeEventListener("scroll", check);
    };
  }, [scrollRef, canLoadMore, loadMore, pageSize, thresholdPx]);
}
