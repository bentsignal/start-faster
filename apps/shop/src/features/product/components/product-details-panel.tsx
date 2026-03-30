import { Loader } from "lucide-react";

import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import type { Product } from "~/features/product/types";
import { stickyHeaderTokens } from "~/components/header/header";
import { getKnownColorHex } from "~/features/product/colors";
import { ColorSwatch } from "~/features/product/components/color-swatch";
import { getOptionValueAvailability } from "~/features/product/lib/option-availability";
import { isColorOptionName } from "~/features/product/lib/option-names";
import { useProductPageStore } from "~/features/product/stores/product-page-store";

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
          {/* <ProductHandle /> */}
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

// function ProductHandle() {
//   const handle = useProductPageStore((store) => store.product.handle);

//   return (
//     <p className="text-muted-foreground mb-8 font-mono text-[10px] tracking-[0.2em] uppercase">
//       {handle}
//     </p>
//   );
// }

function ProductTitle() {
  const title = useProductPageStore((store) => store.product.title);

  return (
    <h1 className="mb-8 text-4xl leading-tight font-semibold tracking-tight lg:text-4xl">
      {title}
    </h1>
  );
}

function ProductPrice() {
  const price = useProductPageStore((store) => store.price);

  return <p className="mb-8 text-2xl font-medium">{price}</p>;
}

function ProductOptionSelector() {
  const options = useProductPageStore((store) => store.options);
  const variants = useProductPageStore((store) => store.product.variants.nodes);
  const selectedVariant = useProductPageStore((store) => store.selectedVariant);
  const selectedOptions = useProductPageStore((store) => store.selectedOptions);
  const selectOption = useProductPageStore((store) => store.selectOption);

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 space-y-6">
      {options.map((option) => {
        const isColorOption = isColorOptionName(option.name);

        if (isColorOption) {
          return (
            <ColorOptionGroup
              key={option.name}
              variants={variants}
              optionName={option.name}
              values={option.values}
              selectedValue={selectedOptions[option.name]}
              selectedOptions={selectedOptions}
              onSelect={(value) => selectOption(option.name, value)}
            />
          );
        }

        return (
          <div key={option.name} className="space-y-3">
            <p className="text-sm font-semibold tracking-wide uppercase">
              {option.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selectedOptions[option.name] === value;
                const availability = getOptionValueAvailability({
                  variants,
                  optionName: option.name,
                  optionValue: value,
                  selectedOptions,
                });
                const isDisabled =
                  isSelected === false && availability !== "available";
                const title =
                  availability === "sold-out"
                    ? `${value} (Sold out)`
                    : availability === "unavailable"
                      ? `${value} (Unavailable)`
                      : value;
                return (
                  <Button
                    key={`${option.name}-${value}`}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    aria-pressed={isSelected}
                    disabled={isDisabled}
                    title={title}
                    className={cn(
                      availability !== "available" &&
                        "text-muted-foreground border-border/60 decoration-1.5 line-through",
                    )}
                    onClick={() => selectOption(option.name, value)}
                  >
                    {value}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}
      {selectedVariant !== null &&
      selectedVariant.availableForSale === false ? (
        <p className="text-destructive text-sm">This variant is sold out.</p>
      ) : null}
    </div>
  );
}

function ColorOptionGroup({
  variants,
  optionName,
  values,
  selectedValue,
  selectedOptions,
  onSelect,
}: {
  variants: Product["variants"]["nodes"];
  optionName: string;
  values: string[];
  selectedValue: string | undefined;
  selectedOptions: Record<string, string>;
  onSelect: (value: string) => void;
}) {
  const knownColors = [];
  const unknownColors = [];

  for (const value of values) {
    if (getKnownColorHex(value)) {
      knownColors.push(value);
    } else {
      unknownColors.push(value);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold tracking-wide uppercase">
        {optionName}
        {selectedValue ? (
          <span className="text-muted-foreground ml-2 font-normal normal-case">
            {selectedValue}
          </span>
        ) : null}
      </p>

      {/* Known-color swatches */}
      {knownColors.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {knownColors.map((value) => {
            const isSelected = selectedValue === value;
            const availability = getOptionValueAvailability({
              variants,
              optionName,
              optionValue: value,
              selectedOptions,
            });

            return (
              <ColorSwatch
                key={`${optionName}-${value}`}
                colorName={value}
                isSelected={isSelected}
                availability={availability}
                onClick={() => onSelect(value)}
              />
            );
          })}
        </div>
      ) : null}

      {/* Unknown-color text buttons (rendered below swatches, not interleaved) */}
      {unknownColors.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {unknownColors.map((value) => {
            const isSelected = selectedValue === value;
            const availability = getOptionValueAvailability({
              variants,
              optionName,
              optionValue: value,
              selectedOptions,
            });
            const isDisabled =
              isSelected === false && availability !== "available";
            const title =
              availability === "sold-out"
                ? `${value} (Sold out)`
                : availability === "unavailable"
                  ? `${value} (Unavailable)`
                  : value;
            return (
              <Button
                key={`${optionName}-${value}`}
                type="button"
                size="sm"
                variant={isSelected ? "default" : "outline"}
                aria-pressed={isSelected}
                disabled={isDisabled}
                title={title}
                className={cn(
                  availability !== "available" &&
                    "text-muted-foreground border-border/60 decoration-1.5 line-through",
                )}
                onClick={() => onSelect(value)}
              >
                {value}
              </Button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ProductActions() {
  const selectedVariant = useProductPageStore((store) => store.selectedVariant);
  const addToCart = useProductPageStore((store) => store.addToCart);
  const wasAddedToCart = useProductPageStore((store) => store.wasAddedToCart);
  const buyNow = useProductPageStore((store) => store.buyNow);
  const isBuyingNow = useProductPageStore((store) => store.isBuyingNow);
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
  const description = useProductPageStore((store) => store.product.description);

  return (
    <p className="text-muted-foreground xs:mb-0 mb-4 text-sm leading-7">
      {description}
    </p>
  );
}
