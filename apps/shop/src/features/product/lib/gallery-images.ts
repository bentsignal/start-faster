import type { Product, ProductGalleryImage } from "~/features/product/types";

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

function getVariantImageMatchTokens(
  productVariant: Product["variants"]["nodes"][number],
) {
  const colorOption = productVariant.selectedOptions.find((selectedOption) =>
    selectedOption.name.toLowerCase().includes("color"),
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
