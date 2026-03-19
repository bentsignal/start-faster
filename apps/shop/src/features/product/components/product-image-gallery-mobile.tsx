import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from "@acme/ui/carousel";

import type { ProductGalleryImage } from "../types";
import { Image } from "~/components/image";
import { useProductPageStore } from "~/features/product/stores/product-page-store";

export function ProductImageGalleryMobile() {
  const images = useProductPageStore((store) => store.galleryImages);
  const productTitle = useProductPageStore((store) => store.product.title);
  const setCarouselApi = useProductPageStore((store) => store.setCarouselApi);

  if (images.length === 0) {
    return <div className="bg-muted h-[min(75vh,640px)] w-full lg:hidden" />;
  }

  return (
    <div className="px-4 pb-6 sm:px-8 lg:hidden">
      <Carousel
        setApi={(carouselApi) => {
          setCarouselApi(carouselApi);
        }}
      >
        <CarouselContent className="ml-0">
          {images.map((image, index) => (
            <MobileImageSlide
              key={image.id}
              image={image}
              index={index}
              productTitle={productTitle}
            />
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
  productTitle,
}: {
  image: ProductGalleryImage;
  index: number;
  productTitle: string;
}) {
  return (
    <CarouselItem className="pl-0">
      <div className="bg-muted/40 aspect-square w-full overflow-hidden">
        <Image
          src={image.url}
          alt={image.altText ?? `${productTitle} image ${index + 1}`}
          width={image.width ?? 1200}
          height={image.height ?? 1200}
          sizes="100vw"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          className="h-full w-full object-contain"
        />
      </div>
    </CarouselItem>
  );
}
