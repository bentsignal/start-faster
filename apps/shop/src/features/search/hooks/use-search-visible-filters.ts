import { useSearchProducts } from "~/features/search/hooks/use-search-products";

export function useSearchVisibleFilters() {
  const { data } = useSearchProducts();
  const filters = data?.productFilters ?? [];
  return filters.filter((filter) => {
    if (String(filter.type) === "PRICE_RANGE") {
      return true;
    }
    return filter.values.some(
      (value) => typeof value.input === "object" && value.input !== null,
    );
  });
}
