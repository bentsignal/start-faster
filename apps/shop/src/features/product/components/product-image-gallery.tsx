import type { ProductGalleryImage } from "~/features/product/types";
import { ProductImageGalleryDesktop } from "~/features/product/components/product-image-gallery-desktop";
import { ProductImageGalleryMobile } from "~/features/product/components/product-image-gallery-mobile";

interface ProductImageGalleryProps {
  images: ProductGalleryImage[];
  productTitle: string;
}

export function ProductImageGallery({
  images,
  productTitle,
}: ProductImageGalleryProps) {
  return (
    <section className="lg:py-14">
      <ProductImageGalleryMobile images={images} productTitle={productTitle} />
      <ProductImageGalleryDesktop images={images} productTitle={productTitle} />
    </section>
  );
}
