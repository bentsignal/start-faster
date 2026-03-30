import { useEffect, useRef, useState } from "react";

import {
  createIntersectionHandler,
  getHeaderHeight,
  getViewportAnchorY,
  getVisibleSections,
  setupScrollInterruptListeners,
} from "~/features/product/lib/gallery-scroll-helpers";

interface UseDesktopProductImageGalleryOptions {
  imageCount: number;
}

/** Owns the programmatic-scroll tracking refs and interrupt listeners. */
function useGalleryScrollManagement() {
  const pendingTargetIndexRef = useRef<number | null>(null);
  const pendingTargetScrollYRef = useRef<number | null>(null);
  const wasInterruptedRef = useRef(false);

  // eslint-disable-next-line no-restricted-syntax -- syncs with external DOM event listeners (wheel, touch, keyboard, pointer)
  useEffect(() => {
    return setupScrollInterruptListeners(
      pendingTargetIndexRef,
      wasInterruptedRef,
    );
  }, []);

  const clampToImageCount = (count: number) => {
    if (
      pendingTargetIndexRef.current !== null &&
      pendingTargetIndexRef.current >= count
    ) {
      pendingTargetIndexRef.current = null;
      pendingTargetScrollYRef.current = null;
      wasInterruptedRef.current = false;
    }
  };

  const markProgrammaticScroll = (index: number, targetTop: number) => {
    pendingTargetIndexRef.current = index;
    wasInterruptedRef.current = false;
    pendingTargetScrollYRef.current = targetTop;
  };

  return {
    pendingTargetIndexRef,
    pendingTargetScrollYRef,
    wasInterruptedRef,
    clampToImageCount,
    markProgrammaticScroll,
  };
}

interface GalleryObserverOptions {
  imageCount: number;
  imageSectionsRef: React.RefObject<(HTMLElement | null)[]>;
  activeImageIndexRef: React.MutableRefObject<number>;
  setActiveImageIndex: (index: number) => void;
  pendingTargetIndexRef: React.RefObject<number | null>;
  pendingTargetScrollYRef: React.RefObject<number | null>;
  wasInterruptedRef: React.RefObject<boolean>;
}

/** Watches section visibility and updates the active image index. */
function useGalleryIntersectionObserver({
  imageCount,
  imageSectionsRef,
  activeImageIndexRef,
  setActiveImageIndex,
  pendingTargetIndexRef,
  pendingTargetScrollYRef,
  wasInterruptedRef,
}: GalleryObserverOptions) {
  // eslint-disable-next-line no-restricted-syntax -- syncs with IntersectionObserver and external DOM scroll state
  useEffect(() => {
    if (imageCount <= 1) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const imageSections = getVisibleSections(imageSectionsRef);
    if (imageSections.length === 0) return;

    const scrollRefs = {
      pendingTargetIndex: pendingTargetIndexRef,
      pendingTargetScrollY: pendingTargetScrollYRef,
      wasInterrupted: wasInterruptedRef,
      imageSections: imageSectionsRef,
    };
    const observer = new IntersectionObserver(
      createIntersectionHandler(
        scrollRefs,
        activeImageIndexRef,
        setActiveImageIndex,
      ),
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: `-${getHeaderHeight()}px 0px -20% 0px`,
      },
    );
    imageSections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [imageCount]);
}

export function useDesktopProductImageGallery({
  imageCount,
}: UseDesktopProductImageGalleryOptions) {
  const imageSectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImageIndexRef = useRef(0);

  const {
    pendingTargetIndexRef,
    pendingTargetScrollYRef,
    wasInterruptedRef,
    clampToImageCount,
    markProgrammaticScroll,
  } = useGalleryScrollManagement();

  // eslint-disable-next-line no-restricted-syntax -- trim refs and clamp active index when imageCount changes
  useEffect(() => {
    imageSectionsRef.current = imageSectionsRef.current.slice(0, imageCount);
    activeImageIndexRef.current =
      imageCount > 0
        ? Math.min(activeImageIndexRef.current, imageCount - 1)
        : 0;
    clampToImageCount(imageCount);
  }, [imageCount]);

  useGalleryIntersectionObserver({
    imageCount,
    imageSectionsRef,
    activeImageIndexRef,
    setActiveImageIndex,
    pendingTargetIndexRef,
    pendingTargetScrollYRef,
    wasInterruptedRef,
  });

  const visibleActiveImageIndex =
    imageCount > 0 ? Math.min(activeImageIndex, imageCount - 1) : 0;

  const setImageSectionRef = (index: number, section: HTMLElement | null) => {
    imageSectionsRef.current[index] = section;
  };

  const scrollToImage = (index: number) => {
    const targetImage = imageSectionsRef.current[index];
    if (!targetImage) return;

    activeImageIndexRef.current = index;
    setActiveImageIndex(index);

    const scrollTop = targetImage.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(scrollTop - getViewportAnchorY(), 0);
    markProgrammaticScroll(index, targetTop);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  return {
    visibleActiveImageIndex,
    setImageSectionRef,
    scrollToImage,
  };
}
