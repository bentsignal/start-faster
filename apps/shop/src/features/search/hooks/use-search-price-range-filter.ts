import { useState } from "react";

import { useSearchFilterActions } from "~/features/search/hooks/use-search-filter-actions";

export function useSearchPriceRangeFilter({
  initialMin,
  initialMax,
}: {
  initialMin: string;
  initialMax: string;
}) {
  const [priceMin, setPriceMin] = useState(initialMin);
  const [priceMax, setPriceMax] = useState(initialMax);
  const [isPriceApplyLoading, setIsPriceApplyLoading] = useState(false);
  const { onApplyPriceRange, isFiltering } = useSearchFilterActions();

  const apply = async () => {
    setIsPriceApplyLoading(true);
    try {
      await onApplyPriceRange(priceMin, priceMax);
    } catch (error) {
      console.error(error);
    }
    setIsPriceApplyLoading(false);
  };

  return {
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    apply,
    isFiltering,
    isPriceApplyLoading,
  };
}
