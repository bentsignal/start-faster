import { useEffect, useRef } from "react";

import { USERS_PAGE_SIZE } from "~/features/user-access/constants";

export function useLoadMoreOnIntersection({
  canLoadMore,
  loadMore,
}: {
  canLoadMore: boolean;
  loadMore: (numItems: number) => void;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // eslint-disable-next-line no-restricted-syntax -- manages IntersectionObserver lifecycle (browser API)
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

        loadMore(USERS_PAGE_SIZE);
      },
      {
        rootMargin: "350px 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [canLoadMore, loadMore]);

  return {
    sentinelRef,
  };
}
