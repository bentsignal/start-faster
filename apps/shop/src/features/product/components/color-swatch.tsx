import { cn } from "@acme/ui/utils";

import type { OptionValueAvailability } from "~/features/product/lib/option-availability";
import {
  getKnownColorHex,
  isDarkColor,
  isLightColor,
} from "~/features/product/colors";

function ColorSwatch({
  colorName,
  isSelected,
  availability,
  onClick,
}: {
  colorName: string;
  isSelected: boolean;
  availability: OptionValueAvailability;
  onClick: () => void;
}) {
  const hex = getKnownColorHex(colorName);

  if (!hex) return null;

  const isColorLight = isLightColor(hex);
  const isColorDark = isDarkColor(hex);
  const isDisabled = availability !== "available" && isSelected === false;
  const availabilityLabel =
    availability === "sold-out"
      ? "Sold out"
      : availability === "unavailable"
        ? "Unavailable"
        : "";
  const title = availabilityLabel
    ? `${colorName} (${availabilityLabel})`
    : colorName;
  const ariaLabel = availabilityLabel
    ? `${colorName}, ${availabilityLabel}`
    : colorName;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-disabled={isDisabled}
      title={title}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "relative size-8 shrink-0 cursor-pointer rounded-full outline-none disabled:cursor-not-allowed",
        "transition-[box-shadow,transform] duration-200 ease-out",
        "focus-visible:ring-ring/50 focus-visible:ring-2",
        isColorLight && "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]",
        isColorDark && "dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]",
        availability !== "available" && [
          "opacity-45",
          "after:bg-foreground/80 after:pointer-events-none after:absolute after:inset-x-0.5 after:top-1/2 after:h-px after:-rotate-45",
        ],
        isSelected
          ? [
              "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),0_1px_6px_rgba(0,0,0,0.18)]",
              "dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15),0_0_0_2px_rgba(255,255,255,0.8)]",
            ]
          : [
              "hover:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.12)]",
              "dark:hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_0_1.5px_rgba(255,255,255,0.5)]",
            ],
      )}
      style={{ backgroundColor: hex }}
    />
  );
}

export { ColorSwatch };
