import { useMemo } from "react";

import type { Product } from "~/features/product/types";
import {
  isColorOptionName,
  isSizeOptionName,
} from "~/features/product/lib/option-names";

function getOptionSortRank(optionName: string) {
  if (isColorOptionName(optionName)) {
    return 0;
  }

  if (isSizeOptionName(optionName)) {
    return 1;
  }

  return 2;
}

function getOrderedProductOptions(
  product: Product,
  canonicalColorOrder: string[],
) {
  const optionValuesByName = new Map<string, string[]>();
  const optionValueSetsByName = new Map<string, Set<string>>();

  for (const option of product.options) {
    optionValuesByName.set(option.name, []);
    optionValueSetsByName.set(option.name, new Set());
  }

  for (const variant of product.variants.nodes) {
    for (const selectedOption of variant.selectedOptions) {
      const values = optionValuesByName.get(selectedOption.name);
      const valueSet = optionValueSetsByName.get(selectedOption.name);

      if (values === undefined || valueSet === undefined) {
        continue;
      }

      if (valueSet.has(selectedOption.value)) {
        continue;
      }

      values.push(selectedOption.value);
      valueSet.add(selectedOption.value);
    }
  }

  const orderedOptions = product.options.map((option, optionIndex) => {
    const variantOrderedValues = optionValuesByName.get(option.name) ?? [];
    const orderedValues = isColorOptionName(option.name)
      ? canonicalColorOrder.filter((color) =>
          variantOrderedValues.includes(color),
        )
      : variantOrderedValues;
    const orderedValueSet = new Set(orderedValues);
    const remainingValues = option.values.filter(
      (value) => !orderedValueSet.has(value),
    );

    const sortRank = getOptionSortRank(option.name);

    return {
      ...option,
      values: [...orderedValues, ...remainingValues],
      sortRank,
      optionIndex,
    };
  });

  return orderedOptions
    .sort((left, right) => {
      if (left.sortRank !== right.sortRank) {
        return left.sortRank - right.sortRank;
      }

      return left.optionIndex - right.optionIndex;
    })
    .map(({ sortRank: _sortRank, optionIndex: _optionIndex, ...option }) => ({
      ...option,
    }));
}

export function useProductOptions(
  product: Product,
  canonicalColorOrder: string[],
) {
  return useMemo(
    () => getOrderedProductOptions(product, canonicalColorOrder),
    [canonicalColorOrder, product],
  );
}
