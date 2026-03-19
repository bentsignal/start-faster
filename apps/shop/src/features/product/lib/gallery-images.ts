import type { Product, ProductGalleryImage } from "~/features/product/types";
import { isColorOptionName } from "~/features/product/lib/option-names";

interface ProductGalleryOrdering {
  images: ProductGalleryImage[];
  colorOrder: string[];
  variantImageIndexById: Record<string, number>;
}

export function getDefaultVariantIdFromGalleryOrdering({
  variants,
  variantImageIndexById,
}: {
  variants: Product["variants"]["nodes"];
  variantImageIndexById: Record<string, number>;
}) {
  let defaultVariantId: string | undefined;
  let bestImageIndex = Number.POSITIVE_INFINITY;

  for (const variant of variants) {
    const imageIndex = variantImageIndexById[variant.id];

    if (imageIndex === undefined || imageIndex >= bestImageIndex) {
      continue;
    }

    bestImageIndex = imageIndex;
    defaultVariantId = variant.id;
  }

  return defaultVariantId ?? variants[0]?.id;
}

export function getProductGalleryImages(
  product: Product,
): ProductGalleryImage[] {
  const galleryImages = product.images.nodes
    .filter((image) => image.url)
    .map((image, index) => ({
      id: image.id ?? `${product.id}-image-${index}`,
      url: image.url,
      altText: image.altText ?? null,
      width: image.width ?? null,
      height: image.height ?? null,
    }));

  if (galleryImages.length > 0) {
    return galleryImages;
  }

  if (product.featuredImage) {
    return [
      {
        id: `${product.id}-featured`,
        url: product.featuredImage.url,
        altText: product.featuredImage.altText ?? null,
        width: null,
        height: null,
      },
    ];
  }

  return [];
}

function normalizeToken(value: string) {
  return value.trim().toLowerCase();
}

function getVariantColorValue(variant: Product["variants"]["nodes"][number]) {
  const colorOption = variant.selectedOptions.find((selectedOption) =>
    isColorOptionName(selectedOption.name),
  );

  return colorOption?.value ?? null;
}

function getVariantImageMatchTokens(
  productVariant: Product["variants"]["nodes"][number],
) {
  const colorOption = productVariant.selectedOptions.find((selectedOption) =>
    isColorOptionName(selectedOption.name),
  );
  const colorToken = colorOption ? normalizeToken(colorOption.value) : null;

  if (colorToken) {
    return [colorToken];
  }

  const fallbackTokens = productVariant.selectedOptions
    .map((selectedOption) => normalizeToken(selectedOption.value))
    .filter((token) => token.length >= 3);

  return fallbackTokens.length > 0
    ? fallbackTokens
    : [normalizeToken(productVariant.title)];
}

export function getVariantImageIndex({
  images,
  variant,
}: {
  images: ProductGalleryImage[];
  variant: Product["variants"]["nodes"][number] | null;
}) {
  if (variant === null) {
    return null;
  }

  if (variant.image) {
    const variantImageIndex = images.findIndex((image) => {
      if (image.id === variant.image?.id) {
        return true;
      }

      return image.url === variant.image?.url;
    });

    if (variantImageIndex >= 0) {
      return variantImageIndex;
    }
  }

  const matchTokens = getVariantImageMatchTokens(variant);

  for (const [index, image] of images.entries()) {
    const searchableText = `${image.altText ?? ""} ${image.url}`.toLowerCase();
    const isMatch = matchTokens.some((token) => searchableText.includes(token));

    if (isMatch) {
      return index;
    }
  }

  return null;
}

function getSourceColorOrder(product: Product) {
  const productColorOption = product.options.find((option) =>
    isColorOptionName(option.name),
  );

  if (productColorOption) {
    return [...new Set(productColorOption.values)];
  }

  const colors: string[] = [];
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

export function getProductGalleryOrdering({
  product,
  variants,
  initialVariantId,
}: {
  product: Product;
  variants: Product["variants"]["nodes"];
  initialVariantId?: string;
}): ProductGalleryOrdering {
  const baseImages = getProductGalleryImages(product);

  if (baseImages.length === 0) {
    return {
      images: [],
      colorOrder: [],
      variantImageIndexById: {},
    };
  }

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

  const mappedColors = [...firstImageIndexByColor.entries()]
    .sort((left, right) => left[1] - right[1])
    .map(([color]) => color);
  const sourceColorOrder = getSourceColorOrder(product);
  const mappedColorSet = new Set(mappedColors);
  let canonicalColorOrder = [
    ...mappedColors,
    ...sourceColorOrder.filter((color) => mappedColorSet.has(color) === false),
  ];

  if (initialVariantId !== undefined) {
    const initialVariantColor = variantColorById.get(initialVariantId);

    if (initialVariantColor !== undefined) {
      const existingColorIndex =
        canonicalColorOrder.indexOf(initialVariantColor);

      if (existingColorIndex > 0) {
        canonicalColorOrder.splice(existingColorIndex, 1);
        canonicalColorOrder = [initialVariantColor, ...canonicalColorOrder];
      }
    }
  }

  const imageIndicesByColor = new Map<string, number[]>();

  for (const color of canonicalColorOrder) {
    imageIndicesByColor.set(color, []);
  }

  for (const variant of variants) {
    const variantColor = variantColorById.get(variant.id);
    const variantImageBaseIndex = variantImageBaseIndexById.get(variant.id);

    if (variantColor === undefined || variantImageBaseIndex === undefined) {
      continue;
    }

    const imageIndexes = imageIndicesByColor.get(variantColor);

    if (imageIndexes === undefined) {
      continue;
    }

    imageIndexes.push(variantImageBaseIndex);
  }

  const orderedImageIndices: number[] = [];
  const includedBaseImageIndices = new Set<number>();

  for (const color of canonicalColorOrder) {
    const imageIndexes = imageIndicesByColor.get(color);

    if (imageIndexes === undefined || imageIndexes.length === 0) {
      continue;
    }

    const sortedUniqueImageIndexes = [...new Set(imageIndexes)].sort(
      (left, right) => left - right,
    );

    for (const imageIndex of sortedUniqueImageIndexes) {
      if (includedBaseImageIndices.has(imageIndex)) {
        continue;
      }

      includedBaseImageIndices.add(imageIndex);
      orderedImageIndices.push(imageIndex);
    }
  }

  for (let index = 0; index < baseImages.length; index += 1) {
    if (includedBaseImageIndices.has(index)) {
      continue;
    }

    orderedImageIndices.push(index);
  }

  if (initialVariantId !== undefined) {
    const initialVariantImageBaseIndex =
      variantImageBaseIndexById.get(initialVariantId);

    if (initialVariantImageBaseIndex !== undefined) {
      const existingIndex = orderedImageIndices.indexOf(
        initialVariantImageBaseIndex,
      );

      if (existingIndex > 0) {
        orderedImageIndices.splice(existingIndex, 1);
        orderedImageIndices.unshift(initialVariantImageBaseIndex);
      }
    }
  }

  const orderedImages = orderedImageIndices
    .map((imageIndex) => baseImages[imageIndex])
    .filter((image): image is ProductGalleryImage => image !== undefined);
  const finalIndexByBaseImageIndex = new Map<number, number>();

  orderedImageIndices.forEach((baseImageIndex, finalIndex) => {
    finalIndexByBaseImageIndex.set(baseImageIndex, finalIndex);
  });

  const variantImageIndexById: Record<string, number> = {};

  for (const [variantId, baseImageIndex] of variantImageBaseIndexById) {
    const finalIndex = finalIndexByBaseImageIndex.get(baseImageIndex);

    if (finalIndex === undefined) {
      continue;
    }

    variantImageIndexById[variantId] = finalIndex;
  }

  return {
    images: orderedImages,
    colorOrder: canonicalColorOrder,
    variantImageIndexById,
  };
}
