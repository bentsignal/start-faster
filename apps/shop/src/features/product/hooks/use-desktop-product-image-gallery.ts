import { useEffect, useRef, useState } from "react";

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
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollUnlockTimeoutRef = useRef<number | null>(null);
  const visibleActiveImageIndex =
    imageCount > 0 ? Math.min(activeImageIndex, imageCount - 1) : 0;

  useEffect(() => {
    imageSectionsRef.current = imageSectionsRef.current.slice(0, imageCount);
  }, [imageCount]);

  useEffect(() => {
    activeImageIndexRef.current =
      imageCount > 0 ? Math.min(activeImageIndexRef.current, imageCount - 1) : 0;
  }, [imageCount]);

  useEffect(() => {
    function unlockProgrammaticScroll() {
      isProgrammaticScrollRef.current = false;

      if (programmaticScrollUnlockTimeoutRef.current !== null) {
        window.clearTimeout(programmaticScrollUnlockTimeoutRef.current);
        programmaticScrollUnlockTimeoutRef.current = null;
      }
    }

    function handleScroll() {
      if (!isProgrammaticScrollRef.current) {
        return;
      }

      if (programmaticScrollUnlockTimeoutRef.current !== null) {
        window.clearTimeout(programmaticScrollUnlockTimeoutRef.current);
      }

      programmaticScrollUnlockTimeoutRef.current = window.setTimeout(() => {
        unlockProgrammaticScroll();
      }, 140);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      unlockProgrammaticScroll();
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

    const imageSections = imageSectionsRef.current.filter(
      (section): section is HTMLElement => section !== null,
    );

    if (imageSections.length === 0) {
      return;
    }

    const headerElement = document.querySelector<HTMLElement>("[data-site-header]");
    const headerHeight = headerElement?.getBoundingClientRect().height ?? 0;
    const intersectionRatios = new Map<number, number>();

    imageSections.forEach((section) => {
      const index = Number(section.getAttribute("data-image-index"));

      if (!Number.isNaN(index)) {
        intersectionRatios.set(index, 0);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) {
          return;
        }

        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-image-index"));

          if (Number.isNaN(index)) {
            return;
          }

          intersectionRatios.set(
            index,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        });

        let mostVisibleIndex = activeImageIndexRef.current;
        let mostVisibleRatio = intersectionRatios.get(mostVisibleIndex) ?? 0;

        intersectionRatios.forEach((ratio, index) => {
          if (ratio > mostVisibleRatio) {
            mostVisibleIndex = index;
            mostVisibleRatio = ratio;
          }
        });

        if (mostVisibleRatio === 0) {
          return;
        }

        const currentRatio =
          intersectionRatios.get(activeImageIndexRef.current) ?? 0;
        const ratioDelta = mostVisibleRatio - currentRatio;

        if (
          mostVisibleIndex !== activeImageIndexRef.current &&
          ratioDelta < 0.08
        ) {
          return;
        }

        if (mostVisibleIndex !== activeImageIndexRef.current) {
          activeImageIndexRef.current = mostVisibleIndex;
          setActiveImageIndex(mostVisibleIndex);
        }
      },
      {
        threshold: [0.2, 0.4, 0.6, 0.8],
        rootMargin: `-${headerHeight}px 0px -35% 0px`,
      },
    );

    imageSections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [imageCount]);

  function setImageSectionRef(index: number, section: HTMLElement | null) {
    imageSectionsRef.current[index] = section;
  }

  function scrollToImage(index: number) {
    const targetImage = imageSectionsRef.current[index];

    if (!targetImage) {
      return;
    }

    activeImageIndexRef.current = index;
    setActiveImageIndex(index);

    isProgrammaticScrollRef.current = true;

    if (programmaticScrollUnlockTimeoutRef.current !== null) {
      window.clearTimeout(programmaticScrollUnlockTimeoutRef.current);
    }

    programmaticScrollUnlockTimeoutRef.current = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
      programmaticScrollUnlockTimeoutRef.current = null;
    }, 1500);

    const scrollTop = targetImage.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: Math.max(scrollTop - 100, 0),
      behavior: "smooth",
    });
  }

  return {
    visibleActiveImageIndex,
    setImageSectionRef,
    scrollToImage,
  };
}
