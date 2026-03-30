import type { Product, ProductGalleryImage } from "~/features/product/types";
import { isColorOptionName } from "~/features/product/lib/option-names";
import { getVariantImageIndex } from "./gallery-images";

function getVariantColorValue(variant: Product["variants"]["nodes"][number]) {
  const colorOption = variant.selectedOptions.find((selectedOption) =>
    isColorOptionName(selectedOption.name),
  );

  return colorOption?.value ?? null;
}

function getSourceColorOrder(product: Product) {
  const productColorOption = product.options.find((option) =>
    isColorOptionName(option.name),
  );

  if (productColorOption) {
    return [...new Set(productColorOption.values)];
  }

  const colors = [];
  const seen = new Set<string>();

  for (const variant of product.variants.nodes) {
    const colorValue = getVariantColorValue(variant);

    if (colorValue === null || seen.has(colorValue)) {
      continue;
    }

    seen.add(colorValue);
    colors.push(colorValue);
  }

  return colors;
}

export function buildVariantMaps(
  variants: Product["variants"]["nodes"],
  baseImages: ProductGalleryImage[],
) {
  const variantImageBaseIndexById = new Map<string, number>();
  const variantColorById = new Map<string, string>();

  for (const variant of variants) {
    const variantImageBaseIndex = getVariantImageIndex({
      images: baseImages,
      variant,
    });
    const variantColor = getVariantColorValue(variant);

    if (variantImageBaseIndex !== null) {
      variantImageBaseIndexById.set(variant.id, variantImageBaseIndex);
    }

    if (variantColor !== null) {
      variantColorById.set(variant.id, variantColor);
    }
  }

  return { variantImageBaseIndexById, variantColorById };
}

export function buildFirstImageIndexByColor(
  variants: Product["variants"]["nodes"],
  variantColorById: Map<string, string>,
  variantImageBaseIndexById: Map<string, number>,
) {
  const firstImageIndexByColor = new Map<string, number>();

  for (const variant of variants) {
    const variantColor = variantColorById.get(variant.id);
    const variantImageBaseIndex = variantImageBaseIndexById.get(variant.id);

    if (variantColor === undefined || variantImageBaseIndex === undefined) {
      continue;
    }

    const existingIndex = firstImageIndexByColor.get(variantColor);

    if (existingIndex === undefined || variantImageBaseIndex < existingIndex) {
      firstImageIndexByColor.set(variantColor, variantImageBaseIndex);
    }
  }

  return firstImageIndexByColor;
}

export function buildCanonicalColorOrder(
  product: Product,
  firstImageIndexByColor: Map<string, number>,
  variantColorById: Map<string, string>,
  initialVariantId: string | undefined,
) {
  const mappedColors = [...firstImageIndexByColor.entries()]
    .sort((left, right) => left[1] - right[1])
    .map(([color]) => color);
  const sourceColorOrder = getSourceColorOrder(product);
  const mappedColorSet = new Set(mappedColors);
  const colorOrder = [
    ...mappedColors,
    ...sourceColorOrder.filter((color) => mappedColorSet.has(color) === false),
  ];

  if (initialVariantId === undefined) {
    return colorOrder;
  }

  const initialVariantColor = variantColorById.get(initialVariantId);
  if (initialVariantColor === undefined) {
    return colorOrder;
  }

  const existingColorIndex = colorOrder.indexOf(initialVariantColor);
  if (existingColorIndex > 0) {
    colorOrder.splice(existingColorIndex, 1);
    colorOrder.unshift(initialVariantColor);
  }

  return colorOrder;
}

function buildImageIndicesByColor(
  canonicalColorOrder: string[],
  variants: Product["variants"]["nodes"],
  variantColorById: Map<string, string>,
  variantImageBaseIndexById: Map<string, number>,
) {
  const imageIndicesByColor = new Map<string, number[]>();

  for (const color of canonicalColorOrder) {
    imageIndicesByColor.set(color, []);
  }

  for (const variant of variants) {
    const variantColor = variantColorById.get(variant.id);
    const variantImageBaseIndex = variantImageBaseIndexById.get(variant.id);

    if (variantColor !== undefined && variantImageBaseIndex !== undefined) {
      imageIndicesByColor.get(variantColor)?.push(variantImageBaseIndex);
    }
  }

  return imageIndicesByColor;
}

function collectColorImageIndices(
  canonicalColorOrder: string[],
  imageIndicesByColor: Map<string, number[]>,
) {
  const orderedImageIndices = new Array<number>();
  const includedBaseImageIndices = new Set<number>();

  for (const color of canonicalColorOrder) {
    const imageIndexes = imageIndicesByColor.get(color);

    if (imageIndexes === undefined || imageIndexes.length === 0) {
      continue;
    }

    const sortedUnique = [...new Set(imageIndexes)].sort(
      (left, right) => left - right,
    );

    for (const imageIndex of sortedUnique) {
      if (!includedBaseImageIndices.has(imageIndex)) {
        includedBaseImageIndices.add(imageIndex);
        orderedImageIndices.push(imageIndex);
      }
    }
  }

  return { orderedImageIndices, includedBaseImageIndices };
}

export function buildOrderedImageIndices({
  canonicalColorOrder,
  variants,
  variantColorById,
  variantImageBaseIndexById,
  baseImageCount,
}: {
  canonicalColorOrder: string[];
  variants: Product["variants"]["nodes"];
  variantColorById: Map<string, string>;
  variantImageBaseIndexById: Map<string, number>;
  baseImageCount: number;
}) {
  const imageIndicesByColor = buildImageIndicesByColor(
    canonicalColorOrder,
    variants,
    variantColorById,
    variantImageBaseIndexById,
  );

  const { orderedImageIndices, includedBaseImageIndices } =
    collectColorImageIndices(canonicalColorOrder, imageIndicesByColor);

  for (let index = 0; index < baseImageCount; index += 1) {
    if (!includedBaseImageIndices.has(index)) {
      orderedImageIndices.push(index);
    }
  }

  return orderedImageIndices;
}

export function promoteInitialVariantImage(
  orderedImageIndices: number[],
  variantImageBaseIndexById: Map<string, number>,
  initialVariantId: string | undefined,
) {
  if (initialVariantId === undefined) {
    return;
  }

  const initialVariantImageBaseIndex =
    variantImageBaseIndexById.get(initialVariantId);

  if (initialVariantImageBaseIndex === undefined) {
    return;
  }

  const existingIndex = orderedImageIndices.indexOf(
    initialVariantImageBaseIndex,
  );

  if (existingIndex > 0) {
    orderedImageIndices.splice(existingIndex, 1);
    orderedImageIndices.unshift(initialVariantImageBaseIndex);
  }
}

export function buildVariantImageIndexById(
  variantImageBaseIndexById: Map<string, number>,
  orderedImageIndices: number[],
) {
  const finalIndexByBaseImageIndex = new Map<number, number>();

  orderedImageIndices.forEach((baseImageIndex, finalIndex) => {
    finalIndexByBaseImageIndex.set(baseImageIndex, finalIndex);
  });

  const result = new Map<string, number>();

  for (const [variantId, baseImageIndex] of variantImageBaseIndexById) {
    const finalIndex = finalIndexByBaseImageIndex.get(baseImageIndex);

    if (finalIndex !== undefined) {
      result.set(variantId, finalIndex);
    }
  }

  return Object.fromEntries(result);
}
