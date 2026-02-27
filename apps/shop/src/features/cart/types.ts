export interface CartMoney {
  amount: number;
  currencyCode: string;
}

export interface CartImage {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface CartSelectedOption {
  name: string;
  value: string;
}

export interface CartLineMerchandise {
  id: string;
  title: string;
  image: CartImage | null;
  product: {
    title: string;
    handle: string;
  };
  selectedOptions: CartSelectedOption[];
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: {
    amountPerQuantity: CartMoney;
    subtotalAmount: CartMoney;
    totalAmount: CartMoney;
  };
  merchandise: CartLineMerchandise;
  isOptimistic?: boolean;
}

export type CartLineSyncStatus =
  | "idle"
  | "queued"
  | "syncing"
  | "retrying"
  | "error";

export interface CartLineIntent {
  desiredQuantity: number;
  version: number;
  status: Exclude<CartLineSyncStatus, "idle">;
  retryCount: number;
  updatedAt: number;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    totalAmount: CartMoney;
  };
  lines: CartLine[];
}

export interface OptimisticCartLineDraft {
  merchandiseId: string;
  quantity: number;
  unitAmount: number;
  currencyCode: string;
  variantTitle: string;
  productTitle: string;
  productHandle: string;
  image: CartImage | null;
  selectedOptions: CartSelectedOption[];
}
