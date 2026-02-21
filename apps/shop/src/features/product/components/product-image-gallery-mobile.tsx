import { Image } from "@unpic/react";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from "@acme/ui/carousel";

import type { ProductGalleryImage } from "~/features/product/types";

interface ProductImageGalleryMobileProps {
  images: ProductGalleryImage[];
  productTitle: string;
}

export function ProductImageGalleryMobile({
  images,
  productTitle,
}: ProductImageGalleryMobileProps) {
  if (images.length === 0) {
    return <div className="bg-muted h-[min(75vh,640px)] w-full lg:hidden" />;
  }

  return (
    <div className="px-4 pb-6 sm:px-8 lg:hidden">
      <Carousel>
        <CarouselContent className="ml-0">
          {images.map((image, index) => (
            <CarouselItem key={image.id} className="pl-0">
              <div className="bg-muted/40 aspect-square w-full overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.altText ?? `${productTitle} image ${index + 1}`}
                  width={image.width ?? 1200}
                  height={image.height ?? 1200}
                  className="h-full w-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots className="mt-5" fallbackDotCount={images.length} />
      </Carousel>
    </div>
  );
}
