import { useMemo } from "react";

import type { Product } from "~/features/product/types";

function getOrderedProductOptions(product: Product) {
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

  return product.options.map((option) => {
    const orderedValues = optionValuesByName.get(option.name) ?? [];
    const orderedValueSet = new Set(orderedValues);
    const remainingValues = option.values.filter(
      (value) => !orderedValueSet.has(value),
    );

    return {
      ...option,
      values: [...orderedValues, ...remainingValues],
    };
  });
}

export function useProductOptions(product: Product) {
  return useMemo(() => getOrderedProductOptions(product), [product]);
}
