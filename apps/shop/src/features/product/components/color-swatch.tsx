import { cn } from "@acme/ui/utils";

import { getKnownColorHex, isLightColor } from "~/features/product/colors";

function ColorSwatch({
  colorName,
  isSelected,
  onClick,
}: {
  colorName: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const hex = getKnownColorHex(colorName);

  if (!hex) return null;

  const isColorLight = isLightColor(hex);

  return (
    <button
      type="button"
      aria-label={colorName}
      aria-pressed={isSelected}
      title={colorName}
      onClick={onClick}
      className={cn(
        "size-8 shrink-0 cursor-pointer rounded-full outline-none",
        "transition-[box-shadow,transform] duration-200 ease-out",
        "focus-visible:ring-ring/50 focus-visible:ring-2",
        isColorLight && "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]",
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
