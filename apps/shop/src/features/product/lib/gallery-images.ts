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
