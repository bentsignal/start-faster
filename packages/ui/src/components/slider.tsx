import { Slider as SliderPrimitive } from "@base-ui/react/slider";

import { cn } from "../lib/utils";

function Slider<Value extends number | readonly number[]>({
  className,
  ...props
}: SliderPrimitive.Root.Props<Value>) {
  return (
    <SliderPrimitive.Root<Value>
      data-slot="slider"
      className={cn("relative flex w-full items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="relative flex h-5 w-full items-center"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="bg-muted relative h-1.5 w-full grow overflow-hidden rounded-full"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className="bg-primary absolute h-full"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="border-primary bg-background focus-visible:ring-ring/50 block size-4 rounded-full border shadow-sm transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
