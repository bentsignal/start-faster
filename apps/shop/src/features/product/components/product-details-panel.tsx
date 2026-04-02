import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { ProductOptionSelector } from "~/features/product/components/product-option-selector";
import { useProductActions } from "~/features/product/hooks/use-product-actions";
import { useSelectedVariant } from "~/features/product/hooks/use-selected-variant";
import { productQueries } from "~/features/product/lib/product-queries";
import { formatMoney } from "~/lib/format-money";
import { stickyHeaderTokens } from "~/lib/layout-tokens";

export function ProductDetailsPanel() {
  return (
    <aside
      className={cn(
        "px-6 pb-6 sm:px-8 md:px-10 lg:self-stretch lg:px-0",
        stickyHeaderTokens.spacer,
      )}
    >
      <div className="mx-auto max-w-xl lg:mx-0 lg:h-full lg:max-w-md xl:max-w-lg">
        <div className={cn(stickyHeaderTokens.stickyContent)}>
          <ProductTitle />
          <ProductOptionSelector />
          <ProductPrice />
          <ProductActions />

          <div className="bg-border mb-8 h-px" />

          <ProductDescription />
        </div>
      </div>
    </aside>
  );
}

function ProductTitle() {
  const { handle } = useParams({ from: "/shop/$handle" });
  const title = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (p) => p.title,
  }).data;

  return (
    <h1 className="mb-8 text-4xl leading-tight font-semibold tracking-tight lg:text-4xl">
      {title}
    </h1>
  );
}

function useProductPrice() {
  const { handle } = useParams({ from: "/shop/$handle" });
  const fallbackPrice = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (p) => p.priceRange.minVariantPrice,
  }).data;
  const { selectedVariant } = useSelectedVariant();
  const selectedPrice = selectedVariant?.price ?? fallbackPrice;
  return {
    price: formatMoney(selectedPrice.amount, selectedPrice.currencyCode),
  };
}

function ProductPrice() {
  const { price } = useProductPrice();

  return <p className="mb-8 text-2xl font-medium">{price}</p>;
}

function ProductActions() {
  const { selectedVariant, addToCart, wasAddedToCart, buyNow, isBuyingNow } =
    useProductActions();
  const isUnavailable =
    selectedVariant === null || selectedVariant.availableForSale === false;

  return (
    <div className="mb-8 flex flex-col gap-2">
      <Button
        disabled={isUnavailable || wasAddedToCart}
        variant="default"
        onClick={addToCart}
      >
        {wasAddedToCart ? "Added to Cart" : "Add to Cart"}
      </Button>
      <Button
        disabled={isUnavailable || isBuyingNow}
        variant="secondary"
        onClick={buyNow}
      >
        {isBuyingNow ? <Loader className="size-4 animate-spin" /> : "Buy Now"}
      </Button>
    </div>
  );
}

function ProductDescription() {
  const { handle } = useParams({ from: "/shop/$handle" });
  const description = useSuspenseQuery({
    ...productQueries.productByHandle(handle),
    select: (p) => p.description,
  }).data;

  return (
    <p className="text-muted-foreground xs:mb-0 mb-4 text-sm leading-7">
      {description}
    </p>
  );
}
