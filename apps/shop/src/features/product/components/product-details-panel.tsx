import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { useSelectedVariant } from "~/features/product/hooks/use-selected-variant";
import { productQueries } from "~/features/product/lib/product-queries";
import { formatMoney } from "~/lib/format-money";

export function ProductTitle() {
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

export function ProductPrice() {
  const { price } = useProductPrice();

  return <p className="mb-8 text-2xl font-medium">{price}</p>;
}

export function ProductDescription() {
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
