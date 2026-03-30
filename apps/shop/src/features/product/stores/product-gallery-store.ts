import { useRef } from "react";
import { createStore } from "rostra";

import type { CarouselApi } from "@acme/ui/carousel";

function useInternalStore() {
  const carouselApiRef = useRef<CarouselApi | null>(null);
  const desktopScrollToImageRef = useRef<((index: number) => void) | null>(
    null,
  );

  const setCarouselApi = (carouselApi: CarouselApi) => {
    carouselApiRef.current = carouselApi;
  };

  const setDesktopScrollToImage = (
    scrollToImage: ((index: number) => void) | null,
  ) => {
    desktopScrollToImageRef.current = scrollToImage;
  };

  return {
    carouselApiRef,
    desktopScrollToImageRef,
    setCarouselApi,
    setDesktopScrollToImage,
  };
}

export const { Store: ProductGalleryStore, useStore: useProductGalleryStore } =
  createStore(useInternalStore);
