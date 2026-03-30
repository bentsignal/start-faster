import type {
  Product,
  ProductForGallery,
  ProductGalleryImage,
} from "~/features/product/types";
import { isColorOptionName } from "~/features/product/lib/option-names";
import {
  buildCanonicalColorOrder,
  buildFirstImageIndexByColor,
  buildOrderedImageIndices,
  buildVariantImageIndexById,
  buildVariantMaps,
  promoteInitialVariantImage,
} from "./gallery-ordering-helpers";

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
  product: Pick<Product, "id" | "images" | "featuredImage">,
) {
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

function emptyGalleryOrdering() {
  const images = new Array<ProductGalleryImage>();
  const colorOrder = new Array<string>();
  const variantImageIndexById = Object.fromEntries(new Map<string, number>());

  return { images, colorOrder, variantImageIndexById };
}

export function getProductGalleryOrdering({
  product,
  variants,
  initialVariantId,
}: {
  product: ProductForGallery;
  variants: Product["variants"]["nodes"];
  initialVariantId?: string;
}) {
  const baseImages = getProductGalleryImages(product);

  if (baseImages.length === 0) {
    return emptyGalleryOrdering();
  }

  const { variantImageBaseIndexById, variantColorById } = buildVariantMaps(
    variants,
    baseImages,
  );

  const firstImageIndexByColor = buildFirstImageIndexByColor(
    variants,
    variantColorById,
    variantImageBaseIndexById,
  );

  const canonicalColorOrder = buildCanonicalColorOrder(
    product,
    firstImageIndexByColor,
    variantColorById,
    initialVariantId,
  );

  const orderedImageIndices = buildOrderedImageIndices({
    canonicalColorOrder,
    variants,
    variantColorById,
    variantImageBaseIndexById,
    baseImageCount: baseImages.length,
  });

  promoteInitialVariantImage(
    orderedImageIndices,
    variantImageBaseIndexById,
    initialVariantId,
  );

  const orderedImages = orderedImageIndices
    .map((imageIndex) => baseImages[imageIndex])
    .filter((image): image is ProductGalleryImage => image !== undefined);

  const variantImageIndexById = buildVariantImageIndexById(
    variantImageBaseIndexById,
    orderedImageIndices,
  );

  return {
    images: orderedImages,
    colorOrder: canonicalColorOrder,
    variantImageIndexById,
  };
}
