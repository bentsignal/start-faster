import { useRef, useState } from "react";
import { Image } from "@unpic/react";

import { cn } from "@acme/ui/utils";

import type { ProductGalleryImage } from "~/features/product/types";
import { stickyHeaderTokens } from "~/components/header/header";

interface ProductImageGalleryDesktopProps {
  images: ProductGalleryImage[];
  productTitle: string;
}

export function ProductImageGalleryDesktop({
  images,
  productTitle,
}: ProductImageGalleryDesktopProps) {
  const imageSectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  function scrollToImage(index: number) {
    const targetImage = imageSectionsRef.current[index];

    if (!targetImage) {
      return;
    }

    setActiveImageIndex(index);

    const scrollTop = targetImage.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: Math.max(scrollTop - 100, 0),
      behavior: "smooth",
    });
  }

  if (images.length === 0) {
    return (
      <div className="bg-muted hidden h-[min(82vh,920px)] w-full lg:block" />
    );
  }

  return (
    <div
      className={cn(
        "hidden items-start lg:grid lg:gap-6 xl:gap-8",
        images.length > 1
          ? "lg:grid-cols-[5rem_minmax(0,1fr)]"
          : "lg:grid-cols-1",
      )}
    >
      <aside className={cn("relative", stickyHeaderTokens.stickyContent)}>
        <div className="space-y-3" aria-label="Product image previews">
          {images.length > 1
            ? images.map((image, index) => (
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
              ))
            : null}
        </div>
      </aside>

      <div className="w-full space-y-4 lg:max-w-2xl xl:max-w-3xl xl:space-y-6">
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
