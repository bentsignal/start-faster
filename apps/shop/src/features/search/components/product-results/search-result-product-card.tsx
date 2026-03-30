import { QuickLink } from "@acme/features/quick-link";

import type { ProductResultNode } from "~/features/product/types";
import { Image } from "~/components/image";
import { formatPrice } from "~/features/product/lib/price";

export function SearchResultProductCard({
  product,
  mode,
  imageLoading = "lazy",
  imageFetchPriority = "auto",
}: {
  product: ProductResultNode;
  mode: "grid" | "list";
  imageLoading?: "lazy" | "eager";
  imageFetchPriority?: "high" | "auto";
}) {
  if (mode === "list") {
    return (
      <ListProductCard
        product={product}
        imageLoading={imageLoading}
        imageFetchPriority={imageFetchPriority}
      />
    );
  }

  return (
    <GridProductCard
      product={product}
      imageLoading={imageLoading}
      imageFetchPriority={imageFetchPriority}
    />
  );
}

interface ProductCardProps {
  product: ProductResultNode;
  imageLoading: "lazy" | "eager";
  imageFetchPriority: "high" | "auto";
}

function ListProductCard({
  product,
  imageLoading,
  imageFetchPriority,
}: ProductCardProps) {
  const price = useProductPrice(product);
  const isUnavailable = getIsUnavailable(product);

  return (
    <article className="group flex gap-3 p-3">
      <div className="shrink-0 overflow-hidden rounded-xl">
        <ProductCardImage
          product={product}
          width={132}
          height={132}
          loading={imageLoading}
          fetchPriority={imageFetchPriority}
          className="bg-muted aspect-square size-[132px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
        <div className="space-y-1.5">
          <ProductCardTitle
            handle={product.handle}
            title={product.title}
            className="text-foreground/90 line-clamp-2 text-sm leading-snug font-medium tracking-tight hover:underline"
          />
          <p className="text-foreground text-lg leading-none font-semibold tracking-tight">
            {price}
          </p>
          {isUnavailable ? (
            <p className="text-destructive text-xs font-medium">Sold out</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function GridProductCard({
  product,
  imageLoading,
  imageFetchPriority,
}: ProductCardProps) {
  const price = useProductPrice(product);
  const isUnavailable = getIsUnavailable(product);

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-xl">
        <ProductCardImage
          product={product}
          width={400}
          height={500}
          loading={imageLoading}
          fetchPriority={imageFetchPriority}
          className="bg-muted aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {isUnavailable ? (
          <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-1.5 text-center text-xs font-medium text-white backdrop-blur-sm">
            Sold out
          </div>
        ) : null}
      </div>

      <div className="mt-3 space-y-0.5">
        <ProductCardTitle
          handle={product.handle}
          title={product.title}
          className="line-clamp-1 text-sm font-medium"
        />
        <p className="text-sm">{price}</p>
      </div>
    </article>
  );
}

function ProductCardImage({
  product,
  width,
  height,
  loading,
  fetchPriority,
  className,
}: {
  product: ProductResultNode;
  width: number;
  height: number;
  loading: "lazy" | "eager";
  fetchPriority: "high" | "auto";
  className: string;
}) {
  return (
    <QuickLink
      to="/shop/$handle"
      params={{ handle: product.handle }}
      className="block"
    >
      {product.featuredImage?.url ? (
        <Image
          src={product.featuredImage.url}
          alt={product.featuredImage.altText ?? product.title}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={fetchPriority}
          className={className}
        />
      ) : (
        <div className={className} />
      )}
    </QuickLink>
  );
}

function ProductCardTitle({
  handle,
  title,
  className,
}: {
  handle: string;
  title: string;
  className: string;
}) {
  return (
    <QuickLink to="/shop/$handle" params={{ handle }} className={className}>
      {title}
    </QuickLink>
  );
}

function useProductPrice(product: ProductResultNode) {
  return formatPrice(
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode,
  );
}

function getIsUnavailable(product: ProductResultNode) {
  const selectedVariant = product.selectedOrFirstAvailableVariant ?? null;
  return selectedVariant === null || selectedVariant.availableForSale === false;
}
