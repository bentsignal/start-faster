import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { stickyHeaderTokens } from "~/components/header/header";
import { useProductStore } from "~/features/product/store";

export function ProductDetailsPanel() {
  return (
    <aside
      className={cn(
        "px-6 py-6 sm:px-8 md:px-10 lg:self-stretch lg:px-0",
        stickyHeaderTokens.spacer,
      )}
    >
      <div className="mx-auto max-w-xl lg:mx-0 lg:h-full lg:max-w-md xl:max-w-lg">
        <div className={cn(stickyHeaderTokens.stickyContent)}>
          <ProductHandle />
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

function ProductHandle() {
  const handle = useProductStore((store) => store.product.handle);

  return (
    <p className="text-muted-foreground mb-8 font-mono text-[10px] tracking-[0.2em] uppercase">
      {handle}
    </p>
  );
}

function ProductTitle() {
  const title = useProductStore((store) => store.product.title);

  return (
    <h1 className="mb-8 text-4xl leading-tight font-semibold tracking-tight lg:text-4xl">
      {title}
    </h1>
  );
}

function ProductPrice() {
  const price = useProductStore((store) => store.price);

  return <p className="mb-8 text-2xl font-medium">{price}</p>;
}

function ProductOptionSelector() {
  const options = useProductStore((store) => store.options);
  const selectedVariant = useProductStore((store) => store.selectedVariant);
  const selectedOptions = useProductStore((store) => store.selectedOptions);
  const selectOption = useProductStore((store) => store.selectOption);

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-6">
      {options.map((option) => (
        <div key={option.name} className="space-y-3">
          <p className="text-sm font-semibold tracking-wide uppercase">
            {option.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selectedOptions[option.name] === value;
              return (
                <Button
                  key={`${option.name}-${value}`}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  aria-pressed={isSelected}
                  onClick={() => selectOption(option.name, value)}
                >
                  {value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      {selectedVariant !== null &&
      selectedVariant.availableForSale === false ? (
        <p className="text-destructive text-sm">This variant is sold out.</p>
      ) : null}
    </div>
  );
}

function ProductActions() {
  const selectedVariant = useProductStore((store) => store.selectedVariant);
  const isUnavailable =
    selectedVariant === null || selectedVariant.availableForSale === false;

  return (
    <div className="mb-8 flex flex-col gap-2">
      <Button disabled={isUnavailable}>Add to Cart</Button>
      <Button disabled={isUnavailable} variant="secondary">
        Buy Now
      </Button>
    </div>
  );
}

function ProductDescription() {
  const description = useProductStore((store) => store.product.description);

  return (
    <p className="text-muted-foreground xs:mb-0 mb-4 text-sm leading-7">
      {description}
    </p>
  );
}
