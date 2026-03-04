import { SearchResultProductCard } from "~/features/search/components/product-results/search-result-product-card";
import { useSearchPageStore } from "~/features/search/stores/search-page-store";

export function SearchProductResultsView() {
  const products = useSearchPageStore((store) => store.products);
  const isFiltering = useSearchPageStore((store) => store.isFiltering);

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground py-10 pt-8 text-center sm:h-[calc(100vh-20rem)] sm:py-16">
          No results found.
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
        {products.map((product) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            mode="list"
          />
        ))}
      </div>
      <div
        className={`hidden grid-cols-2 gap-x-5 gap-y-8 transition-opacity md:grid lg:grid-cols-3 ${
          isFiltering ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        {products.map((product) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            mode="grid"
          />
        ))}
      </div>
    </div>
  );
}
