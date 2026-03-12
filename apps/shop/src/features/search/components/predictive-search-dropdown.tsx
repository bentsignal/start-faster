import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { GetPredictiveSearchQuery } from "@acme/shopify/storefront/generated";

import { Link } from "~/components/link";
import { Image } from "~/features/image";
import { formatPrice } from "~/features/product/lib/price";
import {
  PREDICTIVE_SEARCH_PAGE_SIZE,
  searchQueries,
} from "~/features/search/lib/search-queries";
import { useSearchBarStore } from "~/features/search/stores/search-bar-store";

type PredictiveSearchProduct = NonNullable<
  GetPredictiveSearchQuery["predictiveSearch"]
>["products"][number];

export function PredictiveSearchDropdown() {
  const hidePredictiveDropdown = useSearchBarStore(
    (s) => s.isPredictiveOpen === false || s.searchTerm.trim().length < 2,
  );

  if (hidePredictiveDropdown) {
    return null;
  }

  return (
    <div className="bg-background absolute top-full right-0 left-0 z-50 mt-2 rounded-xl border p-3 shadow-lg">
      <div className="max-h-96 space-y-3 overflow-auto">
        <PredictiveProductsSection />
        <ViewAllResultsLink />
      </div>
    </div>
  );
}

function PredictiveProductsSection() {
  const rawQueryText = useSearchBarStore((s) => s.searchTerm.trim());
  const queryText = useSearchBarStore((s) => s.debouncedSearchTerm.trim());
  const { data: products, isFetching } = useQuery({
    ...searchQueries.predictive({ query: queryText }),
    enabled: queryText.length >= 2,
    select: (data) => data?.products ?? [],
  });
  const [visibleResult, setVisibleResult] = useState<{
    query: string;
    products: PredictiveSearchProduct[];
  } | null>(null);
  const swapTokenRef = useRef(0);

  useEffect(() => {
    swapTokenRef.current += 1;
  }, [queryText]);

  useEffect(() => {
    if (!products || isFetching) {
      return;
    }

    const token = swapTokenRef.current + 1;
    swapTokenRef.current = token;

    void preloadProductImages(products).then(() => {
      if (swapTokenRef.current !== token) {
        return;
      }

      setVisibleResult({
        query: queryText,
        products,
      });
    });
  }, [products, isFetching, queryText]);

  const visibleProducts =
    visibleResult?.query === rawQueryText ? visibleResult.products : null;
  const shouldShowPlaceholder =
    rawQueryText.length >= 2 &&
    (rawQueryText !== queryText || isFetching || visibleProducts === null);

  if (shouldShowPlaceholder || visibleProducts === null) {
    return <PredictiveProductsPlaceholder />;
  }

  if (visibleProducts.length === 0) {
    return (
      <section className="py-1">
        <p className="text-muted-foreground px-2 text-sm">No products found</p>
      </section>
    );
  }

  return (
    <section className="space-y-1.5">
      {visibleProducts.map((product) => (
        <PredictiveProductRow key={product.id} product={product} />
      ))}
    </section>
  );
}

function PredictiveProductRow({
  product,
}: {
  product: PredictiveSearchProduct;
}) {
  const imageUrl = product.featuredImage?.url;
  const imageAlt = product.featuredImage?.altText ?? product.title;
  const price = formatPrice(
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode,
  );

  const setIsPredictiveOpen = useSearchBarStore((s) => s.setIsPredictiveOpen);

  function onSelect() {
    setIsPredictiveOpen(false);
  }

  return (
    <Link
      to="/shop/$handle"
      params={{ handle: product.handle }}
      className="hover:bg-muted flex items-center gap-3 rounded-lg px-2 py-2"
      onClick={onSelect}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={48}
          height={48}
          loading="eager"
          className="bg-muted size-12 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="bg-muted size-12 shrink-0 rounded-md" />
      )}

      <div className="min-w-0">
        <p className="line-clamp-1 text-sm">{product.title}</p>
        <p className="text-muted-foreground text-xs">{price}</p>
      </div>
    </Link>
  );
}

function ViewAllResultsLink() {
  const activeQuery = useSearchBarStore((s) => s.searchTerm.trim());
  const setIsPredictiveOpen = useSearchBarStore((s) => s.setIsPredictiveOpen);

  function onSelect() {
    setIsPredictiveOpen(false);
  }

  return (
    <div className="border-t pt-2">
      <Link
        to="/search"
        search={{
          q: activeQuery,
          sortBy: "relevance",
          sortDirection: "desc",
          filters: [],
        }}
        className="text-muted-foreground block rounded-lg px-2 py-1.5 text-sm font-medium hover:underline"
        onClick={onSelect}
      >
        View all results
      </Link>
    </div>
  );
}

function PredictiveProductsPlaceholder() {
  return (
    <section className="space-y-1.5" aria-hidden="true">
      {Array.from({ length: PREDICTIVE_SEARCH_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg px-2 py-2"
        >
          <div className="bg-muted h-12 w-12 shrink-0 animate-pulse rounded-md" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
            <div className="bg-muted h-3 w-1/4 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </section>
  );
}

function preloadProductImages(products: PredictiveSearchProduct[]) {
  const imageUrls = products
    .map((product) => product.featuredImage?.url)
    .filter((url): url is string => Boolean(url));

  if (imageUrls.length === 0) {
    return Promise.resolve();
  }

  return Promise.all(imageUrls.map((url) => preloadImage(url))).then(
    () => undefined,
  );
}

function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    const image = new window.Image();

    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;

    if (image.complete) {
      resolve();
    }
  });
}
