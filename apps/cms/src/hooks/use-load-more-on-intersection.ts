import { useEffect, useRef } from "react";

export function useLoadMoreOnIntersection({
  canLoadMore,
  loadMore,
  pageSize,
}: {
  canLoadMore: boolean;
  loadMore: (numItems: number) => void;
  pageSize: number;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!canLoadMore) {
      return;
    }

    const node = sentinelRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        loadMore(pageSize);
      },
      {
        rootMargin: "200px 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [canLoadMore, loadMore, pageSize]);

  return {
    sentinelRef,
  };
}
