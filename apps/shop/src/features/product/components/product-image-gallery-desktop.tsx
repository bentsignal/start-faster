import { useEffect, useRef } from "react";
import { Image } from "@unpic/react";

import { cn } from "@acme/ui/utils";

import { stickyHeaderTokens } from "~/components/header/header";
import { useDesktopProductImageGallery } from "~/features/product/hooks/use-desktop-product-image-gallery";
import { useProductStore } from "~/features/product/store";

export function ProductImageGalleryDesktop() {
  const images = useProductStore((store) => store.galleryImages);
  const selectedVariantImageIndex = useProductStore(
    (store) => store.selectedVariantImageIndex,
  );
  const variantImageScrollIndex = useProductStore(
    (store) => store.variantImageScrollIndex,
  );
  const variantImageScrollRequestId = useProductStore(
    (store) => store.variantImageScrollRequestId,
  );
  const initialVariantImageFocusMode = useProductStore(
    (store) => store.initialVariantImageFocusMode,
  );
  const { visibleActiveImageIndex, setImageSectionRef, scrollToImage } =
    useDesktopProductImageGallery({ imageCount: images.length });
  const hasAutoFocusedSelectedVariantImageRef = useRef(false);

  useEffect(() => {
    if (hasAutoFocusedSelectedVariantImageRef.current) {
      return;
    }

    hasAutoFocusedSelectedVariantImageRef.current = true;

    if (
      initialVariantImageFocusMode === "scroll" &&
      selectedVariantImageIndex !== null &&
      selectedVariantImageIndex > 0
    ) {
      scrollToImage(selectedVariantImageIndex);
    }
  }, [initialVariantImageFocusMode, scrollToImage, selectedVariantImageIndex]);

  useEffect(() => {
    if (variantImageScrollRequestId === 0 || variantImageScrollIndex === null) {
      return;
    }

    scrollToImage(variantImageScrollIndex);
  }, [scrollToImage, variantImageScrollIndex, variantImageScrollRequestId]);

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
          {images.map((image, index) => (
            <GalleryThumbnail
              key={`${image.id}-thumbnail`}
              imageIndex={index}
              isActive={visibleActiveImageIndex === index}
              onSelect={scrollToImage}
            />
          ))}
        </div>
      </aside>

      <div className="w-full space-y-4 lg:max-w-2xl xl:max-w-3xl xl:space-y-6">
        {images.map((image, index) => (
          <GalleryImageSection
            key={image.id}
            imageIndex={index}
            setImageSectionRef={setImageSectionRef}
          />
        ))}
      </div>
    </div>
  );
}

function GalleryThumbnail({
  imageIndex,
  isActive,
  onSelect,
}: {
  imageIndex: number;
  isActive: boolean;
  onSelect: (index: number) => void;
}) {
  const image = useProductStore((store) => store.galleryImages[imageIndex]);
  const productTitle = useProductStore((store) => store.product.title);

  if (image === undefined) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(imageIndex)}
      className={cn(
        "group bg-muted/30 focus-visible:ring-foreground/60 focus-visible:ring-offset-background block w-full overflow-hidden border-2 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        isActive
          ? "border-foreground bg-background dark:bg-zinc-900"
          : "border-border/80 hover:border-foreground/60 hover:bg-background/70 dark:border-white/20 dark:hover:border-white/70 dark:hover:bg-white/5",
      )}
      aria-label={`View image ${imageIndex + 1}`}
      aria-current={isActive ? "true" : undefined}
    >
      <div className="aspect-square w-full">
        <Image
          src={image.url}
          alt={image.altText ?? `${productTitle} preview ${imageIndex + 1}`}
          width={image.width ?? 300}
          height={image.height ?? 300}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-150",
            isActive
              ? "opacity-100"
              : "opacity-85 group-hover:opacity-100 dark:opacity-65 dark:group-hover:opacity-95",
          )}
        />
      </div>
    </button>
  );
}

function GalleryImageSection({
  imageIndex,
  setImageSectionRef,
}: {
  imageIndex: number;
  setImageSectionRef: (index: number, section: HTMLElement | null) => void;
}) {
  const image = useProductStore((store) => store.galleryImages[imageIndex]);
  const productTitle = useProductStore((store) => store.product.title);

  if (image === undefined) {
    return null;
  }

  return (
    <section
      ref={(section) => {
        setImageSectionRef(imageIndex, section);
      }}
      data-image-index={imageIndex}
      className="bg-muted/40 overflow-hidden"
    >
      <div className="h-[min(82vh,920px)] w-full">
        <Image
          src={image.url}
          alt={image.altText ?? `${productTitle} image ${imageIndex + 1}`}
          width={image.width ?? 1600}
          height={image.height ?? 1600}
          className="h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
