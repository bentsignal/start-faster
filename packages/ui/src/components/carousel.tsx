"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./button";

interface CarouselApi {
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
  selectedScrollSnap: () => number;
  scrollSnapList: () => number[];
}

interface CarouselProps {
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
}

type CarouselContextProps = {
  carouselRef: (node: HTMLDivElement | null) => void;
  api: CarouselApi;
  setSlideCount: (count: number) => void;
  handleViewportScroll: () => void;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  scrollSnaps: number[];
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  setApi,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const selectedIndexRef = React.useRef(0);
  const slideCountRef = React.useRef(0);

  const carouselRef = React.useCallback((node: HTMLDivElement | null) => {
    viewportRef.current = node;
  }, []);

  const [slideCount, setSlideCountState] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const scrollSnaps = React.useMemo(
    () => Array.from({ length: slideCount }, (_, index) => index),
    [slideCount],
  );

  const getSlideSize = React.useCallback(() => {
    const viewport = viewportRef.current;

    if (!viewport) return 0;

    return orientation === "horizontal"
      ? viewport.clientWidth
      : viewport.clientHeight;
  }, [orientation]);

  const getRenderedIndexFromScroll = React.useCallback(() => {
    const viewport = viewportRef.current;
    const slideSize = getSlideSize();

    if (!viewport || slideSize <= 0) return 0;

    const scrollPosition =
      orientation === "horizontal" ? viewport.scrollLeft : viewport.scrollTop;

    return Math.round(scrollPosition / slideSize);
  }, [getSlideSize, orientation]);

  const updateSelectionState = React.useCallback((renderedIndex: number) => {
    const nextSelected = Math.max(
      0,
      Math.min(slideCountRef.current - 1, renderedIndex),
    );
    selectedIndexRef.current = nextSelected;

    setSelectedIndex((current) =>
      current === nextSelected ? current : nextSelected,
    );

    const nextCanScrollPrev = slideCountRef.current > 1 && nextSelected > 0;
    const nextCanScrollNext =
      slideCountRef.current > 1 && nextSelected < slideCountRef.current - 1;

    setCanScrollPrev((current) =>
      current === nextCanScrollPrev ? current : nextCanScrollPrev,
    );
    setCanScrollNext((current) =>
      current === nextCanScrollNext ? current : nextCanScrollNext,
    );
  }, []);

  const scrollToRendered = React.useCallback(
    (renderedIndex: number, behavior: ScrollBehavior) => {
      const viewport = viewportRef.current;
      const slideSize = getSlideSize();

      if (!viewport || slideSize <= 0) return;

      const nextPosition = renderedIndex * slideSize;

      viewport.scrollTo(
        orientation === "horizontal"
          ? { left: nextPosition, behavior }
          : { top: nextPosition, behavior },
      );
    },
    [getSlideSize, orientation],
  );

  const scrollTo = React.useCallback(
    (index: number) => {
      if (slideCountRef.current <= 0) return;

      const safeIndex = Math.max(0, Math.min(slideCountRef.current - 1, index));

      scrollToRendered(safeIndex, "smooth");
      updateSelectionState(safeIndex);
    },
    [scrollToRendered, updateSelectionState],
  );

  const scrollPrev = React.useCallback(() => {
    if (slideCountRef.current <= 0) return;
    scrollTo(Math.max(0, selectedIndexRef.current - 1));
  }, [scrollTo]);

  const scrollNext = React.useCallback(() => {
    if (slideCountRef.current <= 0) return;
    scrollTo(Math.min(slideCountRef.current - 1, selectedIndexRef.current + 1));
  }, [scrollTo]);

  const api = React.useMemo<CarouselApi>(
    () => ({
      scrollPrev,
      scrollNext,
      scrollTo,
      canScrollPrev: () =>
        slideCountRef.current > 1 && selectedIndexRef.current > 0,
      canScrollNext: () =>
        slideCountRef.current > 1 &&
        selectedIndexRef.current < slideCountRef.current - 1,
      selectedScrollSnap: () => selectedIndexRef.current,
      scrollSnapList: () =>
        Array.from({ length: slideCountRef.current }, (_, index) => index),
    }),
    [scrollNext, scrollPrev, scrollTo],
  );

  const setSlideCount = React.useCallback((count: number) => {
    slideCountRef.current = count;
    setSlideCountState((current) => (current === count ? current : count));
  }, []);

  const handleViewportScroll = React.useCallback(() => {
    updateSelectionState(getRenderedIndexFromScroll());
  }, [getRenderedIndexFromScroll, updateSelectionState]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useLayoutEffect(() => {
    if (slideCount <= 0) return;

    const frameId = window.requestAnimationFrame(() => {
      scrollToRendered(0, "auto");
      updateSelectionState(getRenderedIndexFromScroll());
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    getRenderedIndexFromScroll,
    scrollToRendered,
    slideCount,
    updateSelectionState,
  ]);

  React.useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(() => {
      const currentIndex = selectedIndexRef.current;
      scrollToRendered(currentIndex, "auto");
      updateSelectionState(getRenderedIndexFromScroll());
    });

    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, [getRenderedIndexFromScroll, scrollToRendered, updateSelectionState]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        setSlideCount,
        handleViewportScroll,
        orientation,
        scrollPrev,
        scrollNext,
        scrollTo,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        scrollSnaps,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { carouselRef, orientation, setSlideCount, handleViewportScroll } =
    useCarousel();
  const childArray = React.Children.toArray(children);

  React.useEffect(() => {
    setSlideCount(childArray.length);
  }, [childArray.length, setSlideCount]);

  return (
    <div
      ref={carouselRef}
      onScroll={handleViewportScroll}
      className={cn(
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        orientation === "horizontal"
          ? "touch-auto snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain"
          : "touch-auto snap-y snap-mandatory overflow-x-hidden overflow-y-auto overscroll-y-contain",
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full snap-start",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

function CarouselDots({
  className,
  dotClassName,
  activeDotClassName,
  fallbackDotCount,
  ...props
}: React.ComponentProps<"div"> & {
  dotClassName?: string;
  activeDotClassName?: string;
  fallbackDotCount?: number;
}) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();
  const dots =
    scrollSnaps.length > 0
      ? scrollSnaps
      : Array.from({ length: fallbackDotCount ?? 0 }, (_, index) => index);

  if (dots.length <= 1) return null;

  return (
    <div
      data-slot="carousel-dots"
      className={cn("flex items-center justify-center gap-2", className)}
      {...props}
    >
      {dots.map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          aria-current={selectedIndex === index ? "true" : undefined}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            selectedIndex === index
              ? cn("bg-foreground w-6", activeDotClassName)
              : cn(
                  "bg-foreground/25 hover:bg-foreground/40 focus-visible:bg-foreground/40 w-2",
                  dotClassName,
                ),
          )}
          onClick={() => scrollTo(index)}
        />
      ))}
    </div>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  useCarousel,
};
