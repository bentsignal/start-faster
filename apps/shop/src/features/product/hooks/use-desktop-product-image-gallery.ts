import { useCallback, useEffect, useRef, useState } from "react";

interface UseDesktopProductImageGalleryOptions {
  imageCount: number;
}

interface UseDesktopProductImageGalleryReturn {
  visibleActiveImageIndex: number;
  setImageSectionRef: (index: number, section: HTMLElement | null) => void;
  scrollToImage: (index: number) => void;
}

export function useDesktopProductImageGallery({
  imageCount,
}: UseDesktopProductImageGalleryOptions): UseDesktopProductImageGalleryReturn {
  const imageSectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImageIndexRef = useRef(0);
  const pendingProgrammaticTargetIndexRef = useRef<number | null>(null);
  const pendingProgrammaticTargetScrollYRef = useRef<number | null>(null);
  const wasProgrammaticScrollInterruptedRef = useRef(false);
  const visibleActiveImageIndex =
    imageCount > 0 ? Math.min(activeImageIndex, imageCount - 1) : 0;

  const getHeaderHeight = useCallback(() => {
    const headerElement =
      document.querySelector<HTMLElement>("[data-site-header]");

    return headerElement?.getBoundingClientRect().height ?? 0;
  }, []);

  const getViewportAnchorY = useCallback(() => {
    return getHeaderHeight() + 24;
  }, [getHeaderHeight]);

  const getVisibleSections = useCallback(() => {
    return imageSectionsRef.current.filter(
      (section): section is HTMLElement => section !== null,
    );
  }, []);

  useEffect(() => {
    imageSectionsRef.current = imageSectionsRef.current.slice(0, imageCount);
  }, [imageCount]);

  useEffect(() => {
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

  useEffect(() => {
    function interruptProgrammaticScroll() {
      if (pendingProgrammaticTargetIndexRef.current === null) {
        return;
      }

      wasProgrammaticScrollInterruptedRef.current = true;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === "PageUp" ||
        event.key === "PageDown" ||
        event.key === "Home" ||
        event.key === "End" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        interruptProgrammaticScroll();
      }
    }

    window.addEventListener("wheel", interruptProgrammaticScroll, {
      passive: true,
    });
    window.addEventListener("touchstart", interruptProgrammaticScroll, {
      passive: true,
    });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", interruptProgrammaticScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("wheel", interruptProgrammaticScroll);
      window.removeEventListener("touchstart", interruptProgrammaticScroll);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", interruptProgrammaticScroll);
    };
  }, []);

  useEffect(() => {
    if (imageCount <= 1) {
      return;
    }

    const desktopBreakpoint = window.matchMedia("(min-width: 1024px)");

    if (!desktopBreakpoint.matches) {
      return;
    }

    const imageSections = getVisibleSections();

    if (imageSections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      () => {
        const sections = getVisibleSections();

        if (sections.length === 0) {
          return;
        }

        const anchorY = getViewportAnchorY();
        let closestSectionIndex = activeImageIndexRef.current;
        let closestDistance = Number.POSITIVE_INFINITY;

        sections.forEach((section) => {
          const index = Number(section.getAttribute("data-image-index"));

          if (Number.isNaN(index)) {
            return;
          }

          const rect = section.getBoundingClientRect();

          if (rect.bottom <= anchorY || rect.top >= window.innerHeight) {
            return;
          }

          const distance = Math.abs(rect.top - anchorY);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestSectionIndex = index;
          }
        });

        if (closestDistance === Number.POSITIVE_INFINITY) {
          return;
        }

        const pendingTargetIndex = pendingProgrammaticTargetIndexRef.current;

        if (pendingTargetIndex !== null) {
          if (wasProgrammaticScrollInterruptedRef.current) {
            pendingProgrammaticTargetIndexRef.current = null;
            pendingProgrammaticTargetScrollYRef.current = null;
            wasProgrammaticScrollInterruptedRef.current = false;
          } else {
            const targetSection = imageSectionsRef.current[pendingTargetIndex];

            if (!targetSection) {
              pendingProgrammaticTargetIndexRef.current = null;
              pendingProgrammaticTargetScrollYRef.current = null;
            } else {
              const targetDistance = Math.abs(
                targetSection.getBoundingClientRect().top - anchorY,
              );
              const targetScrollY = pendingProgrammaticTargetScrollYRef.current;
              const isNearTargetScrollY =
                targetScrollY !== null &&
                Math.abs(window.scrollY - targetScrollY) <= 6;

              if (targetDistance <= 6 || isNearTargetScrollY) {
                pendingProgrammaticTargetIndexRef.current = null;
                pendingProgrammaticTargetScrollYRef.current = null;
              } else {
                return;
              }
            }
          }
        }

        if (closestSectionIndex !== activeImageIndexRef.current) {
          activeImageIndexRef.current = closestSectionIndex;
          setActiveImageIndex(closestSectionIndex);
        }
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        rootMargin: `-${getHeaderHeight()}px 0px -20% 0px`,
      },
    );

    imageSections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [getHeaderHeight, getViewportAnchorY, getVisibleSections, imageCount]);

  const setImageSectionRef = useCallback(
    (index: number, section: HTMLElement | null) => {
      imageSectionsRef.current[index] = section;
    },
    [],
  );

  const scrollToImage = useCallback(
    (index: number) => {
      const targetImage = imageSectionsRef.current[index];

      if (!targetImage) {
        return;
      }

      activeImageIndexRef.current = index;
      setActiveImageIndex(index);

      pendingProgrammaticTargetIndexRef.current = index;
      wasProgrammaticScrollInterruptedRef.current = false;

      const scrollTop =
        targetImage.getBoundingClientRect().top + window.scrollY;
      const targetTop = Math.max(scrollTop - getViewportAnchorY(), 0);
      pendingProgrammaticTargetScrollYRef.current = targetTop;

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    },
    [getViewportAnchorY],
  );

  return {
    visibleActiveImageIndex,
    setImageSectionRef,
    scrollToImage,
  };
}
