import { useState } from "react";
import { useSearch } from "@tanstack/react-router";

import { useCollectionFilterActions } from "~/features/collections/hooks/use-collection-filter-actions";
import { getPriceRangeFromFilters } from "~/features/collections/lib/collection-filter-utils";

export function useCollectionPriceRangeFilter() {
  const selectedFilters = useSearch({
    from: "/collections/$handle",
    select: (search) => search.filters,
  });
  const priceRange = getPriceRangeFromFilters(selectedFilters);

  const [priceMin, setPriceMin] = useState(priceRange.min);
  const [priceMax, setPriceMax] = useState(priceRange.max);
  const [isPriceApplyLoading, setIsPriceApplyLoading] = useState(false);
  const { onApplyPriceRange, isFiltering } = useCollectionFilterActions();

  const onApply = () => {
    setIsPriceApplyLoading(true);
    void onApplyPriceRange(priceMin, priceMax).finally(() => {
      setIsPriceApplyLoading(false);
    });
  };

  return {
    priceMin,
    priceMax,
    setPriceMin,
    setPriceMax,
    isFiltering,
    isPriceApplyLoading,
    onApply,
  };
}
