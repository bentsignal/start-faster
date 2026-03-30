import { useRouterState } from "@tanstack/react-router";

import { useCollectionProducts } from "~/features/collections/hooks/use-collection-products";
import { SearchResultProductCard } from "~/features/search/components/product-results/search-result-product-card";

export function CollectionProductResultsView() {
  const { products } = useCollectionProducts();
  const isFiltering = useRouterState({ select: (s) => s.isLoading });

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground py-10 pt-8 text-center sm:h-[calc(100vh-20rem)] sm:py-16">
          No products found in this collection.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <div
        className={`space-y-3 transition-opacity md:hidden ${
          isFiltering ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        {products.map((product, index) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            mode="list"
            imageLoading={index === 0 ? "eager" : "lazy"}
            imageFetchPriority={index === 0 ? "high" : "auto"}
          />
        ))}
      </div>
      <div
        className={`hidden grid-cols-2 gap-x-5 gap-y-8 transition-opacity md:grid lg:grid-cols-3 ${
          isFiltering ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        {products.map((product, index) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            mode="grid"
            imageLoading={index === 0 ? "eager" : "lazy"}
            imageFetchPriority={index === 0 ? "high" : "auto"}
          />
        ))}
      </div>
    </div>
  );
}
