import type {
  CustomerOrderLineItem,
  LiveOrderProducts,
} from "~/features/account/types";

export type LiveOrderProduct = Extract<
  NonNullable<LiveOrderProducts[number]>,
  { __typename: "Product" }
>;

export type ProductImage = CustomerOrderLineItem["image"] | null;

export function getLiveProduct(
  lineItem: CustomerOrderLineItem,
  liveProducts: LiveOrderProducts | undefined,
) {
  return liveProducts?.find(
    (product): product is LiveOrderProduct =>
      product?.__typename === "Product" && product.id === lineItem.productId,
  );
}

export type DisplayedMoney = ReturnType<typeof getDisplayedMoney>;

export function getDisplayedMoney(
  lineItem: CustomerOrderLineItem,
  liveProducts: LiveOrderProducts | undefined,
) {
  const liveProduct = getLiveProduct(lineItem, liveProducts);

  return (
    lineItem.totalPrice ??
    lineItem.price ??
    (liveProduct?.__typename === "Product"
      ? liveProduct.priceRange.minVariantPrice
      : null)
  );
}

export function resolveProductImage(
  lineItem: CustomerOrderLineItem,
  liveProduct: LiveOrderProduct | undefined,
) {
  const liveVariantImage = liveProduct?.variants.nodes.find(
    (variant) => variant.id === lineItem.variantId,
  )?.image;

  return (
    liveVariantImage ?? lineItem.image ?? liveProduct?.featuredImage ?? null
  );
}

export function resolveProductDisplayProps(
  lineItem: CustomerOrderLineItem,
  liveProducts: LiveOrderProducts | undefined,
) {
  const liveProduct = getLiveProduct(lineItem, liveProducts);
  const image = resolveProductImage(lineItem, liveProduct);
  const title = liveProduct?.title ?? lineItem.title;
  const price = getDisplayedMoney(lineItem, liveProducts);
  const shouldShowVariant =
    lineItem.variantTitle !== null && lineItem.variantTitle !== "Default Title";

  return { liveProduct, image, title, price, shouldShowVariant };
}
