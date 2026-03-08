import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@acme/ui/carousel";

import type { CollectionProductNode } from "~/features/product/types";
import { SearchResultProductCard } from "~/features/search/components/product-results/search-result-product-card";

export function ProductCarousel({
  products,
}: {
  products: CollectionProductNode[];
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Carousel className="w-full px-10 sm:px-12 lg:px-14">
      <CarouselContent className="-ml-3 px-2 sm:-ml-4">
        {products.map((product) => (
          <CarouselItem
            key={product.id}
            className="basis-full pl-3 sm:basis-1/2 sm:pl-4 lg:basis-1/3 xl:basis-1/4"
          >
            <div className="h-full">
              <SearchResultProductCard product={product} mode="grid" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="top-[40%] left-1" />
      <CarouselNext className="top-[40%] right-1" />
    </Carousel>
  );
}
