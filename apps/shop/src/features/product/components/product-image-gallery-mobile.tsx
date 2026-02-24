import { Image } from "@unpic/react";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from "@acme/ui/carousel";

import type { ProductGalleryImage } from "../types";
import { useProductStore } from "~/features/product/store";

export function ProductImageGalleryMobile() {
  const images = useProductStore((store) => store.galleryImages);

  if (images.length === 0) {
    return <div className="bg-muted h-[min(75vh,640px)] w-full lg:hidden" />;
  }

  return (
    <div className="px-4 pb-6 sm:px-8 lg:hidden">
      <Carousel>
        <CarouselContent className="ml-0">
          {images.map((image, index) => (
            <MobileImageSlide key={image.id} image={image} index={index} />
          ))}
        </CarouselContent>
        <CarouselDots className="mt-5" fallbackDotCount={images.length} />
      </Carousel>
    </div>
  );
}

function MobileImageSlide({
  image,
  index,
}: {
  image: ProductGalleryImage;
  index: number;
}) {
  const productTitle = useProductStore((store) => store.product.title);

  return (
    <CarouselItem className="pl-0">
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
  );
}
