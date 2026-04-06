import type {
  CartByIdQuery,
  CartCreateForCartMutation,
  CartLinesAddForCartMutation,
  CartLinesRemoveForCartMutation,
  CartLinesUpdateForCartMutation,
} from "@acme/shopify/storefront/generated";

export type CartSource =
  | CartByIdQuery["cart"]
  | NonNullable<CartCreateForCartMutation["cartCreate"]>["cart"]
  | NonNullable<CartLinesAddForCartMutation["cartLinesAdd"]>["cart"]
  | NonNullable<CartLinesUpdateForCartMutation["cartLinesUpdate"]>["cart"]
  | NonNullable<CartLinesRemoveForCartMutation["cartLinesRemove"]>["cart"];

export type ServerCart = NonNullable<CartSource>;

type ServerCartLine = ServerCart["lines"]["nodes"][number];

export type CartLine = ServerCartLine & {
  isOptimistic?: boolean;
};

export type Cart = Omit<ServerCart, "lines"> & {
  lines: Omit<ServerCart["lines"], "nodes"> & {
    nodes: CartLine[];
  };
};

export type CartImage = NonNullable<
  NonNullable<CartLine["merchandise"]["image"]>
>;

export type CartSelectedOption =
  CartLine["merchandise"]["selectedOptions"][number];

export interface CartMutationContext {
  previousCartId: string | null;
}

export interface OptimisticCartLineDraft {
  merchandiseId: string;
  quantity: number;
  unitAmount: CartLine["cost"]["amountPerQuantity"]["amount"];
  currencyCode: CartLine["cost"]["amountPerQuantity"]["currencyCode"];
  variantTitle: string;
  productTitle: string;
  productHandle: string;
  image: CartImage | null;
  selectedOptions: CartSelectedOption[];
}
