import { Image } from "@unpic/react";

import { cn } from "@acme/ui/utils";

import type { ProductGalleryImage } from "~/features/product/types";
import { stickyHeaderTokens } from "~/components/header/header";
import { useDesktopProductImageGallery } from "~/features/product/hooks/use-desktop-product-image-gallery";

interface ProductImageGalleryDesktopProps {
  images: ProductGalleryImage[];
  productTitle: string;
}

export function ProductImageGalleryDesktop({
  images,
  productTitle,
}: ProductImageGalleryDesktopProps) {
  const { visibleActiveImageIndex, setImageSectionRef, scrollToImage } =
    useDesktopProductImageGallery({ imageCount: images.length });

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
                    "group bg-muted/30 focus-visible:ring-foreground/60 focus-visible:ring-offset-background block w-full overflow-hidden border-2 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    visibleActiveImageIndex === index
                      ? "border-foreground bg-background dark:bg-zinc-900"
                      : "border-border/80 hover:border-foreground/60 hover:bg-background/70 dark:border-white/20 dark:hover:border-white/70 dark:hover:bg-white/5",
                  )}
                  aria-label={`View image ${index + 1}`}
                  aria-current={
                    visibleActiveImageIndex === index ? "true" : undefined
                  }
                >
                  <div className="aspect-square w-full">
                    <Image
                      src={image.url}
                      alt={
                        image.altText ?? `${productTitle} preview ${index + 1}`
                      }
                      width={image.width ?? 300}
                      height={image.height ?? 300}
                      className={cn(
                        "h-full w-full object-cover transition-opacity duration-150",
                        visibleActiveImageIndex === index
                          ? "opacity-100"
                          : "opacity-85 group-hover:opacity-100 dark:opacity-65 dark:group-hover:opacity-95",
                      )}
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
              setImageSectionRef(index, section);
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
