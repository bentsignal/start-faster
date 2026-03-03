import { Image } from "@unpic/react";
import { Loader, ShoppingBag } from "lucide-react";

import { Button } from "@acme/ui/button";

import type { SearchResultProductNode } from "~/features/search/types";
import { Link } from "~/components/link";
import {
  ProductResultStore,
  useProductResultStore,
} from "~/features/product/stores/product-result-store";

export function SearchResultProductCard({
  product,
  mode,
}: {
  product: SearchResultProductNode;
  mode: "grid" | "list";
}) {
  return (
    <ProductResultStore product={product}>
      {mode === "list" ? <ListProductCard /> : <GridProductCard />}
    </ProductResultStore>
  );
}

function ListProductCard() {
  return (
    <article className="flex gap-4">
      <div className="shrink-0">
        <SearchResultProductCardImage
          width={120}
          height={120}
          className="bg-muted size-28 rounded-lg object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div className="space-y-1">
          <SearchResultProductCardTitle className="line-clamp-2 text-sm font-medium hover:underline" />
          <SearchResultProductCardPrice />
          <SearchResultProductCardSoldOut className="text-destructive text-xs" />
        </div>

        <SearchResultProductCardAddToCartButton />
      </div>
    </article>
  );
}

function GridProductCard() {
  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-lg">
        <SearchResultProductCardImage
          width={400}
          height={500}
          className="bg-muted aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <SearchResultProductCardQuickAddButton />
        <SearchResultProductCardSoldOutBadge />
      </div>

      <div className="mt-3 space-y-0.5">
        <SearchResultProductCardTitle className="line-clamp-1 text-sm font-medium" />
        <SearchResultProductCardPrice />
      </div>
    </article>
  );
}

function SearchResultProductCardImage({
  width,
  height,
  className,
}: {
  width: number;
  height: number;
  className: string;
}) {
  const handle = useProductResultStore((store) => store.product.handle);
  const title = useProductResultStore((store) => store.product.title);
  const featuredImage = useProductResultStore(
    (store) => store.product.featuredImage,
  );

  return (
    <Link to="/shop/$handle" params={{ handle }} className="block">
      {featuredImage?.url ? (
        <Image
          src={featuredImage.url}
          alt={featuredImage.altText ?? title}
          width={width}
          height={height}
          className={className}
        />
      ) : (
        <div className={className} />
      )}
    </Link>
  );
}

function SearchResultProductCardTitle({ className }: { className: string }) {
  const handle = useProductResultStore((store) => store.product.handle);
  const title = useProductResultStore((store) => store.product.title);

  return (
    <Link to="/shop/$handle" params={{ handle }} className={className}>
      {title}
    </Link>
  );
}

function SearchResultProductCardPrice() {
  const price = useProductResultStore((store) => store.price);

  return <p className="text-muted-foreground text-sm">{price}</p>;
}

function SearchResultProductCardAddToCartButton() {
  const isUnavailable = useProductResultStore((store) => store.isUnavailable);
  const wasAddedToCart = useProductResultStore((store) => store.wasAddedToCart);
  const addToCart = useProductResultStore((store) => store.addToCart);

  return (
    <Button
      size="sm"
      variant="outline"
      className="mt-2 w-fit"
      disabled={isUnavailable || wasAddedToCart}
      onClick={addToCart}
    >
      {wasAddedToCart ? "Added" : "Add to Cart"}
    </Button>
  );
}

function SearchResultProductCardQuickAddButton() {
  const isUnavailable = useProductResultStore((store) => store.isUnavailable);
  const wasAddedToCart = useProductResultStore((store) => store.wasAddedToCart);
  const isBuyingNow = useProductResultStore((store) => store.isBuyingNow);
  const addToCart = useProductResultStore((store) => store.addToCart);

  if (isUnavailable) {
    return null;
  }

  return (
    <div className="absolute right-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
      <Button
        size="icon"
        variant="secondary"
        className="bg-background/80 size-9 backdrop-blur-sm"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          addToCart();
        }}
        disabled={wasAddedToCart}
      >
        {wasAddedToCart ? (
          <ShoppingBag className="size-4" />
        ) : isBuyingNow ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <ShoppingBag className="size-4" />
        )}
      </Button>
    </div>
  );
}

function SearchResultProductCardSoldOut({ className }: { className: string }) {
  const isUnavailable = useProductResultStore((store) => store.isUnavailable);

  if (!isUnavailable) {
    return null;
  }

  return <p className={className}>Sold out</p>;
}

function SearchResultProductCardSoldOutBadge() {
  const isUnavailable = useProductResultStore((store) => store.isUnavailable);

  if (!isUnavailable) {
    return null;
  }

  return (
    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-1.5 text-center text-xs font-medium text-white backdrop-blur-sm">
      Sold out
    </div>
  );
}
