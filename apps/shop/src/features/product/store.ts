import { useEffect, useMemo, useState } from "react";
import { createStore } from "rostra";

import type { Product } from "./types";
import { getProductGalleryImages } from "~/features/product/lib/gallery-images";

interface ProductStoreProps {
  handle: string;
  product: Product;
  initialVariantId?: string;
  onVariantIdChange: (variantId: string) => void;
}

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

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

function useInternalStore({
  handle,
  product,
  initialVariantId,
  onVariantIdChange,
}: ProductStoreProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(initialVariantId);

  useEffect(() => {
    setSelectedVariantId(initialVariantId);
  }, [initialVariantId]);

  const variants = product.variants.nodes;
  const defaultVariant =
    variants.find((variant) => variant.availableForSale) ?? variants[0] ?? null;
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ??
    defaultVariant;
  const selectedOptions =
    selectedVariant?.selectedOptions.reduce<Record<string, string>>(
      (accumulator, option) => {
        accumulator[option.name] = option.value;
        return accumulator;
      },
      {},
    ) ?? {};

  const selectedPrice =
    selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const price = useMemo(
    () => formatPrice(selectedPrice.amount, selectedPrice.currencyCode),
    [selectedPrice.amount, selectedPrice.currencyCode],
  );

  const galleryImages = useMemo(
    () => getProductGalleryImages(product),
    [product],
  );
  const options = useMemo(() => getOrderedProductOptions(product), [product]);

  function setVariantById(variantId: string) {
    const nextVariant = variants.find((variant) => variant.id === variantId);

    if (nextVariant === undefined) {
      return;
    }

    setSelectedVariantId(nextVariant.id);
    onVariantIdChange(nextVariant.id);
  }

  function selectOption(optionName: string, optionValue: string) {
    if (selectedVariant === null) {
      return;
    }

    const nextSelections = {
      ...selectedOptions,
      [optionName]: optionValue,
    };
    const nextVariant =
      variants.find((variant) =>
        variant.selectedOptions.every(
          (selectedOption) =>
            nextSelections[selectedOption.name] === selectedOption.value,
        ),
      ) ?? selectedVariant;

    setSelectedVariantId(nextVariant.id);
    onVariantIdChange(nextVariant.id);
  }

  return {
    handle,
    product,
    options,
    galleryImages,
    price,
    selectedVariant,
    selectedOptions,
    selectOption,
    setVariantById,
  };
}

export const { Store: ProductStore, useStore: useProductStore } =
  createStore(useInternalStore);
