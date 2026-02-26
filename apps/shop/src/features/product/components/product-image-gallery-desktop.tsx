import { Image } from "@unpic/react";

import { cn } from "@acme/ui/utils";

import type { ProductGalleryImage } from "~/features/product/types";
import { stickyHeaderTokens } from "~/components/header/header";
import { useDesktopProductImageGallery } from "~/features/product/hooks/use-desktop-product-image-gallery";
import { useProductStore } from "~/features/product/store";

export function ProductImageGalleryDesktop() {
  const images = useProductStore((store) => store.galleryImages);
  const productTitle = useProductStore((store) => store.product.title);
  const imageOrderKey = images.map((image) => image.id).join("|");

  if (images.length === 0) {
    return (
      <div className="bg-muted hidden h-[min(82vh,920px)] w-full lg:block" />
    );
  }

  return (
    <DesktopGalleryContent
      key={imageOrderKey}
      images={images}
      productTitle={productTitle}
    />
  );
}

function DesktopGalleryContent({
  images,
  productTitle,
}: {
  images: ProductGalleryImage[];
  productTitle: string;
}) {
  const { visibleActiveImageIndex, setImageSectionRef, scrollToImage } =
    useDesktopProductImageGallery({
      imageCount: images.length,
    });

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
              image={image}
              imageIndex={index}
              isActive={visibleActiveImageIndex === index}
              productTitle={productTitle}
              onSelect={scrollToImage}
            />
          ))}
        </div>
      </aside>

      <div className="w-full space-y-4 lg:max-w-2xl xl:max-w-3xl xl:space-y-6">
        {images.map((image, index) => (
          <GalleryImage
            key={image.id}
            image={image}
            imageIndex={index}
            productTitle={productTitle}
            setImageSectionRef={setImageSectionRef}
          />
        ))}
      </div>
    </div>
  );
}

function GalleryThumbnail({
  image,
  imageIndex,
  isActive,
  productTitle,
  onSelect,
}: {
  image: ProductGalleryImage;
  imageIndex: number;
  isActive: boolean;
  productTitle: string;
  onSelect: (index: number) => void;
}) {
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

function GalleryImage({
  image,
  imageIndex,
  productTitle,
  setImageSectionRef,
}: {
  image: ProductGalleryImage;
  imageIndex: number;
  productTitle: string;
  setImageSectionRef: (index: number, section: HTMLElement | null) => void;
}) {
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
