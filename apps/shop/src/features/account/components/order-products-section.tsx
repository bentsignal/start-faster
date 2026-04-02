import { QuickLink } from "@acme/features/quick-link";

import type {
  DisplayedMoney,
  ProductImage,
} from "~/features/account/lib/order-product-helpers";
import type { OrderListItem } from "~/features/account/lib/orders-list-data";
import type {
  CustomerOrderLineItem,
  LiveOrderProducts,
} from "~/features/account/types";
import { Image } from "~/components/image";
import { resolveProductDisplayProps } from "~/features/account/lib/order-product-helpers";
import { formatMoney } from "~/lib/format-money";

function OrderProductTile({
  lineItem,
  liveProducts,
}: {
  lineItem: CustomerOrderLineItem;
  liveProducts: LiveOrderProducts | undefined;
}) {
  const { liveProduct, image, title, price, shouldShowVariant } =
    resolveProductDisplayProps(lineItem, liveProducts);

  if (liveProduct !== undefined) {
    return (
      <QuickLink
        to="/shop/$handle"
        params={{ handle: liveProduct.handle }}
        className="group flex items-center gap-4"
      >
        <OrderProductContent
          image={image}
          title={title}
          lineItem={lineItem}
          shouldShowVariant={shouldShowVariant}
          isLinkedTitle
          isUnavailable={false}
          price={price}
        />
      </QuickLink>
    );
  }

  return (
    <article className="flex items-center gap-4">
      <OrderProductContent
        image={image}
        title={title}
        lineItem={lineItem}
        shouldShowVariant={shouldShowVariant}
        isLinkedTitle={false}
        isUnavailable
        price={price}
      />
    </article>
  );
}

function OrderProductImage({
  image,
  title,
}: {
  image: ProductImage;
  title: string;
}) {
  if (image?.url) {
    return (
      <Image
        src={image.url}
        alt={image.altText ?? title}
        width={144}
        height={144}
        className="bg-muted aspect-square size-24 rounded-xl object-cover sm:size-28"
      />
    );
  }

  return (
    <div className="bg-muted aspect-square size-24 rounded-xl sm:size-28" />
  );
}

function OrderProductText({
  lineItem,
  title,
  shouldShowVariant,
  isLinkedTitle,
  isUnavailable,
  price,
}: {
  lineItem: CustomerOrderLineItem;
  title: string;
  shouldShowVariant: boolean;
  isLinkedTitle: boolean;
  isUnavailable: boolean;
  price: DisplayedMoney;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="space-y-1">
        {isLinkedTitle ? (
          <p className="line-clamp-2 text-sm leading-snug font-medium underline-offset-4 group-hover:underline">
            {title}
          </p>
        ) : (
          <p className="line-clamp-2 text-sm leading-snug font-medium">
            {title}
          </p>
        )}
        {shouldShowVariant ? (
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {lineItem.variantTitle}
          </p>
        ) : null}
      </div>

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span>Qty {lineItem.quantity}</span>
        {price ? (
          <span className="text-foreground font-medium">
            {formatMoney(price.amount, price.currencyCode)}
          </span>
        ) : null}
        {isUnavailable ? (
          <span className="text-muted-foreground bg-muted inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium uppercase">
            No longer available
          </span>
        ) : null}
      </div>
    </div>
  );
}

function OrderProductContent({
  image,
  title,
  lineItem,
  shouldShowVariant,
  isLinkedTitle,
  isUnavailable,
  price,
}: {
  image: ProductImage;
  title: string;
  lineItem: CustomerOrderLineItem;
  shouldShowVariant: boolean;
  isLinkedTitle: boolean;
  isUnavailable: boolean;
  price: DisplayedMoney;
}) {
  return (
    <>
      <div className="shrink-0">
        <OrderProductImage image={image} title={title} />
      </div>
      <OrderProductText
        lineItem={lineItem}
        title={title}
        shouldShowVariant={shouldShowVariant}
        isLinkedTitle={isLinkedTitle}
        isUnavailable={isUnavailable}
        price={price}
      />
    </>
  );
}

export function OrderProductsSection({
  order,
  liveProducts,
}: {
  order: OrderListItem;
  liveProducts: LiveOrderProducts;
}) {
  const lineItems = order.lineItems.nodes;

  if (lineItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      {lineItems.map((lineItem) => (
        <OrderProductTile
          key={lineItem.id}
          lineItem={lineItem}
          liveProducts={liveProducts}
        />
      ))}
    </div>
  );
}
