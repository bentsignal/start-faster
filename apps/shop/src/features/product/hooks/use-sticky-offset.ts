import { useEffect, useState } from "react";

const STICKY_GAP_PX = 16;

function getStickyOffsetValue() {
  if (typeof document === "undefined") {
    return STICKY_GAP_PX;
  }

  const siteHeader = document.querySelector<HTMLElement>("[data-site-header]");

  if (!siteHeader) {
    return STICKY_GAP_PX;
  }

  return siteHeader.getBoundingClientRect().height + STICKY_GAP_PX;
}

export function useStickyOffset() {
  const [stickyOffset, setStickyOffset] = useState(getStickyOffsetValue);

  useEffect(() => {
    const siteHeader =
      document.querySelector<HTMLElement>("[data-site-header]");

    if (!siteHeader) {
      return;
    }

    const updateOffset = () => {
      setStickyOffset(getStickyOffsetValue());
    };
    const frame = window.requestAnimationFrame(updateOffset);

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => updateOffset());

    resizeObserver?.observe(siteHeader);
    window.addEventListener("resize", updateOffset);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  return stickyOffset;
}
