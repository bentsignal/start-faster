import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import type { Product } from "~/features/product/types";
import { stickyHeaderTokens } from "~/components/header/header";

interface ProductDetailsPanelProps {
  handle: string;
  product: Product;
  price: string;
}

export function ProductDetailsPanel({
  handle,
  product,
  price,
}: ProductDetailsPanelProps) {
  return (
    <aside
      className={cn(
        "px-6 py-6 sm:px-8 md:px-10 lg:self-stretch lg:px-0",
        stickyHeaderTokens.spacer,
      )}
    >
      <div className="mx-auto max-w-xl lg:mx-0 lg:h-full lg:max-w-md xl:max-w-lg">
        <div className={cn(stickyHeaderTokens.stickyContent)}>
          <p className="text-muted-foreground mb-8 font-mono text-[10px] tracking-[0.2em] uppercase">
            {handle}
          </p>

          <h1 className="mb-8 text-4xl leading-tight font-semibold tracking-tight lg:text-4xl">
            {product.title}
          </h1>

          <p className="mb-8 text-2xl font-medium">{price}</p>

          <div className="mb-8 flex flex-col gap-2">
            <Button>Add to Cart</Button>
            <Button variant="secondary">Buy Now</Button>
          </div>

          <div className="bg-border mb-8 h-px" />

          <p className="text-muted-foreground text-sm leading-7">
            {product.description}
          </p>
        </div>
      </div>
    </aside>
  );
}
