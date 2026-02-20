import { useEffect, useRef, useState } from "react";
import { Image } from "@unpic/react";

import { cn } from "@acme/ui/utils";

import type { ProductGalleryImage } from "~/features/product/types";

interface ProductImageGalleryDesktopProps {
  images: ProductGalleryImage[];
  productTitle: string;
  stickyOffset: number;
}

export function ProductImageGalleryDesktop({
  images,
  productTitle,
  stickyOffset,
}: ProductImageGalleryDesktopProps) {
  const imageSectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    imageSectionsRef.current = imageSectionsRef.current.slice(0, images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) {
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

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);

        if (visibleEntries.length === 0) {
          return;
        }

        const mostVisibleEntry = visibleEntries.reduce(
          (bestEntry, currentEntry) =>
            currentEntry.intersectionRatio > bestEntry.intersectionRatio
              ? currentEntry
              : bestEntry,
        );

        const index = Number(
          mostVisibleEntry.target.getAttribute("data-image-index"),
        );

        if (!Number.isNaN(index)) {
          setActiveImageIndex(index);
        }
      },
      {
        threshold: [0.2, 0.4, 0.6, 0.8],
        rootMargin: `-${stickyOffset}px 0px -35% 0px`,
      },
    );

    imageSections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [images.length, stickyOffset]);

  const scrollToImage = (index: number) => {
    const targetImage = imageSectionsRef.current[index];

    if (!targetImage) {
      return;
    }

    setActiveImageIndex(index);

    const scrollTop = targetImage.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: Math.max(scrollTop - stickyOffset, 0),
      behavior: "smooth",
    });
  };

  if (images.length === 0) {
    return (
      <div className="bg-muted hidden h-[min(82vh,920px)] w-full lg:block" />
    );
  }

  return (
    <div
      className={cn(
        "hidden lg:grid lg:items-start lg:gap-6 xl:gap-8",
        images.length > 1
          ? "lg:grid-cols-[5rem_minmax(0,1fr)]"
          : "lg:grid-cols-1",
      )}
    >
      {images.length > 1 ? (
        <aside className="relative">
          <div
            className="sticky space-y-3"
            style={{ top: `${stickyOffset}px` }}
            aria-label="Product image previews"
          >
            {images.map((image, index) => (
              <button
                key={`${image.id}-thumbnail`}
                type="button"
                onClick={() => scrollToImage(index)}
                className={cn(
                  "bg-muted/40 block w-full overflow-hidden border transition-colors",
                  activeImageIndex === index
                    ? "border-foreground"
                    : "border-border hover:border-foreground/40",
                )}
                aria-label={`View image ${index + 1}`}
                aria-current={activeImageIndex === index ? "true" : undefined}
              >
                <div className="aspect-square w-full">
                  <Image
                    src={image.url}
                    alt={
                      image.altText ?? `${productTitle} preview ${index + 1}`
                    }
                    width={image.width ?? 300}
                    height={image.height ?? 300}
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </aside>
      ) : null}

      <div className="space-y-4 xl:space-y-6">
        {images.map((image, index) => (
          <section
            key={image.id}
            ref={(section) => {
              imageSectionsRef.current[index] = section;
            }}
            data-image-index={index}
            className="bg-muted/40 overflow-hidden"
          >
            <div className="h-[min(82vh,920px)] w-full">
              <Image
                src={image.url}
                alt={image.altText ?? `${productTitle} image ${index + 1}`}
                width={image.width ?? 1600}
                height={image.height ?? 1600}
                className="h-full w-full object-cover"
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
