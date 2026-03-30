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

export function useDesktopProductImageGallery({
  imageCount,
}: UseDesktopProductImageGalleryOptions) {
  const imageSectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImageIndexRef = useRef(0);
  const pendingProgrammaticTargetIndexRef = useRef<number | null>(null);
  const pendingProgrammaticTargetScrollYRef = useRef<number | null>(null);
  const wasProgrammaticScrollInterruptedRef = useRef(false);
  const visibleActiveImageIndex =
    imageCount > 0 ? Math.min(activeImageIndex, imageCount - 1) : 0;

  // eslint-disable-next-line no-restricted-syntax -- trim refs and clamp active index when imageCount changes
  useEffect(() => {
    imageSectionsRef.current = imageSectionsRef.current.slice(0, imageCount);
    activeImageIndexRef.current =
      imageCount > 0
        ? Math.min(activeImageIndexRef.current, imageCount - 1)
        : 0;
    if (
      pendingProgrammaticTargetIndexRef.current !== null &&
      pendingProgrammaticTargetIndexRef.current >= imageCount
    ) {
      pendingProgrammaticTargetIndexRef.current = null;
      pendingProgrammaticTargetScrollYRef.current = null;
      wasProgrammaticScrollInterruptedRef.current = false;
    }
  }, [imageCount]);

  // eslint-disable-next-line no-restricted-syntax -- syncs with external DOM event listeners (wheel, touch, keyboard, pointer)
  useEffect(() => {
    return setupScrollInterruptListeners(
      pendingProgrammaticTargetIndexRef,
      wasProgrammaticScrollInterruptedRef,
    );
  }, []);

  // eslint-disable-next-line no-restricted-syntax -- syncs with IntersectionObserver and external DOM scroll state
  useEffect(() => {
    if (imageCount <= 1) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const imageSections = getVisibleSections(imageSectionsRef);
    if (imageSections.length === 0) return;

    const scrollRefs = {
      pendingTargetIndex: pendingProgrammaticTargetIndexRef,
      pendingTargetScrollY: pendingProgrammaticTargetScrollYRef,
      wasInterrupted: wasProgrammaticScrollInterruptedRef,
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

  const setImageSectionRef = (index: number, section: HTMLElement | null) => {
    imageSectionsRef.current[index] = section;
  };

  const scrollToImage = (index: number) => {
    const targetImage = imageSectionsRef.current[index];
    if (!targetImage) return;

    activeImageIndexRef.current = index;
    setActiveImageIndex(index);
    pendingProgrammaticTargetIndexRef.current = index;
    wasProgrammaticScrollInterruptedRef.current = false;

    const scrollTop = targetImage.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(scrollTop - getViewportAnchorY(), 0);
    pendingProgrammaticTargetScrollYRef.current = targetTop;
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  return {
    visibleActiveImageIndex,
    setImageSectionRef,
    scrollToImage,
  };
}
