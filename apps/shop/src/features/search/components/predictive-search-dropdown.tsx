import { useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";

import type { PredictiveSearchProduct } from "~/features/search/types";
import { Link } from "~/components/link";
import { formatPrice } from "~/features/product/lib/price";
import { searchQueries } from "~/features/search/lib/search-queries";
import { useSearchBarStore } from "~/features/search/stores/search-bar-store";

export function PredictiveSearchDropdown() {
  const hidePredictiveDropdown = useSearchBarStore(
    (s) => s.isPredictiveOpen === false || s.searchTerm.length < 2,
  );

  if (hidePredictiveDropdown) {
    return null;
  }

  return (
    <div className="bg-background absolute top-full right-0 left-0 z-50 mt-2 rounded-xl border p-3 shadow-lg">
      <div className="max-h-96 space-y-3 overflow-auto">
        <PredictiveProductsSection />
        <PredictiveSuggestionsSection />
        <ViewAllResultsLink />
      </div>
    </div>
  );
}

function PredictiveProductsSection() {
  const queryText = useSearchBarStore((s) => s.debouncedSearchTerm.trim());
  const { data: products } = useQuery({
    ...searchQueries.predictive({ query: queryText }),
    placeholderData: (previousData) => previousData,
    select: (data) => data.products,
  });

  if (!products) {
    return null;
  }

  if (products.length === 0) {
    return (
      <section className="py-1">
        <p className="text-muted-foreground px-2 text-sm">No products found</p>
      </section>
    );
  }

  return (
    <section className="space-y-1.5">
      {products.map((product) => (
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

function PredictiveSuggestionsSection() {
  const queryText = useSearchBarStore((s) => s.debouncedSearchTerm.trim());
  const { data: suggestions } = useQuery({
    ...searchQueries.predictive({ query: queryText }),
    select: (data) => data.suggestions,
  });

  const setIsPredictiveOpen = useSearchBarStore((s) => s.setIsPredictiveOpen);

  if (!suggestions) {
    return null;
  }

  if (suggestions.length === 0) {
    return null;
  }

  function onSelect() {
    setIsPredictiveOpen(false);
  }

  return (
    <section className="space-y-1.5 border-t pt-2">
      <p className="text-muted-foreground px-2 text-xs uppercase">
        Suggestions
      </p>
      {suggestions.map((suggestion) => (
        <Link
          key={suggestion.text}
          to="/search"
          search={{
            q: suggestion.text,
            sortBy: "relevance",
            sortDirection: "desc",
            filters: [],
            page: 1,
          }}
          className="hover:bg-muted block rounded-lg px-2 py-1.5 text-sm"
          onClick={onSelect}
        >
          {suggestion.text}
        </Link>
      ))}
    </section>
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
          page: 1,
        }}
        className="text-primary block rounded-lg px-2 py-1.5 text-sm font-medium hover:underline"
        onClick={onSelect}
      >
        View all results
      </Link>
    </div>
  );
}
