import { SearchResultProductCard } from "~/features/search/components/product-results/search-result-product-card";
import { useSearchPageStore } from "~/features/search/stores/search-page-store";

export function SearchProductResultsView() {
  const products = useSearchPageStore((store) => store.products);

  if (products.length === 0) {
    return (
      <p className="text-muted-foreground py-16 text-center text-sm">
        No results found.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-4 md:hidden">
        {products.map((product) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            mode="list"
          />
        ))}
      </div>
      <div className="hidden grid-cols-2 gap-x-5 gap-y-8 md:grid lg:grid-cols-3">
        {products.map((product) => (
          <SearchResultProductCard
            key={product.id}
            product={product}
            mode="grid"
          />
        ))}
      </div>
    </>
  );
}
