import { useState } from "react";
import { ImageIcon, ImagePlus } from "lucide-react";

import type { ImageBlock } from "@acme/convex/page-validators";
import { Button } from "@acme/ui/button";
import {
  clampImageBlockWidthScale,
  IMAGE_BLOCK_MAX_WIDTH_SCALE,
  IMAGE_BLOCK_MIN_WIDTH_SCALE,
  ImageBlockWrapper,
} from "@acme/ui/image-block";
import { Input } from "@acme/ui/input";
import { Slider } from "@acme/ui/slider";

import type { ImagePickerSelection } from "./image-picker-dialog";
import { Image } from "~/components/image";
import { env } from "~/env";
import { buildFileUrl, toConvexSiteUrl } from "~/features/files/lib/format";
import { ImagePickerDialog } from "./image-picker-dialog";

const convexSiteUrl = toConvexSiteUrl(env.VITE_CONVEX_URL);

function useImageBlockEditor({
  block,
  onChange,
}: {
  block: ImageBlock;
  onChange: (block: ImageBlock) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  function handleSelect(selection: ImagePickerSelection) {
    const previous = block.data.status === "ready" ? block.data : null;
    onChange({
      ...block,
      data: {
        status: "ready",
        fileId: selection.fileId,
        downloadToken: selection.downloadToken,
        fileName: selection.fileName,
        alt: previous?.alt ?? "",
        widthScale: clampImageBlockWidthScale(previous?.widthScale),
      },
    });
  }

  // Each handler re-clamps both numeric fields on every save. Drafts created
  // before these settings existed have `verticalPadding`/`widthScale` missing
  // at runtime; without the clamp the autosave mutation would fail validation
  // against `v.number()` and the change would silently never persist.
  function handleAltChange(alt: string) {
    if (block.data.status !== "ready") return;
    onChange({
      ...block,
      data: {
        ...block.data,
        alt,
        widthScale: clampImageBlockWidthScale(block.data.widthScale),
      },
    });
  }

  function handleWidthScaleChange(widthScale: number) {
    if (block.data.status !== "ready") return;
    onChange({
      ...block,
      data: {
        ...block.data,
        widthScale: clampImageBlockWidthScale(widthScale),
      },
    });
  }

  return {
    pickerOpen,
    openPicker: () => setPickerOpen(true),
    setPickerOpen,
    handleSelect,
    handleAltChange,
    handleWidthScaleChange,
  };
}

export function ImageBlockEditor({
  block,
  onChange,
}: {
  block: ImageBlock;
  onChange: (block: ImageBlock) => void;
}) {
  const {
    pickerOpen,
    openPicker,
    setPickerOpen,
    handleSelect,
    handleAltChange,
    handleWidthScaleChange,
  } = useImageBlockEditor({ block, onChange });

  return (
    <div className="flex flex-col gap-4 p-4">
      {block.data.status === "empty" ? (
        <EmptyState onChoose={openPicker} />
      ) : (
        <ReadyState
          fileName={block.data.fileName}
          downloadToken={block.data.downloadToken}
          alt={block.data.alt}
          widthScale={clampImageBlockWidthScale(block.data.widthScale)}
          onReplace={openPicker}
          onAltChange={handleAltChange}
          onWidthScaleChange={handleWidthScaleChange}
        />
      )}

      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handleSelect}
      />
    </div>
  );
}

function EmptyState({ onChoose }: { onChoose: () => void }) {
  return (
    <button
      type="button"
      onClick={onChoose}
      className="border-border bg-muted/30 hover:border-foreground/40 hover:bg-muted/50 focus-visible:ring-ring flex items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-5 text-left transition-colors outline-none focus-visible:ring-2"
    >
      <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
        <ImageIcon className="text-muted-foreground size-4" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm font-medium">Choose image</span>
        <span className="text-muted-foreground text-xs">
          Pick from the library or upload a new one.
        </span>
      </div>
    </button>
  );
}

function ReadyState({
  fileName,
  downloadToken,
  alt,
  widthScale,
  onReplace,
  onAltChange,
  onWidthScaleChange,
}: {
  fileName: string;
  downloadToken: string;
  alt: string;
  widthScale: number;
  onReplace: () => void;
  onAltChange: (value: string) => void;
  onWidthScaleChange: (value: number) => void;
}) {
  const url = buildFileUrl({ convexSiteUrl, downloadToken, fileName });

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-lg">
        <ImageBlockWrapper widthScale={widthScale}>
          <Image
            src={url}
            alt={alt || fileName}
            width={1024}
            height={768}
            sizes="(min-width: 768px) 600px, 100vw"
            preserveSearch
            className="h-auto w-full rounded-md object-contain"
          />
        </ImageBlockWrapper>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-muted-foreground truncate text-xs">
          {fileName}
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={onReplace}
          className="gap-2"
        >
          <ImagePlus className="size-3.5" />
          Pick a new image
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={`image-block-alt-${downloadToken}`}
          className="text-muted-foreground text-xs font-medium"
        >
          Alt text
        </label>
        <Input
          id={`image-block-alt-${downloadToken}`}
          value={alt}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder="Describe the image for screen readers"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <SliderField
          id={`image-block-width-${downloadToken}`}
          label="Width"
          valueLabel={`${Math.round(widthScale * 100)}%`}
          value={widthScale}
          min={IMAGE_BLOCK_MIN_WIDTH_SCALE}
          max={IMAGE_BLOCK_MAX_WIDTH_SCALE}
          step={0.05}
          onChange={onWidthScaleChange}
        />
      </div>
    </div>
  );
}

function SliderField({
  id,
  label,
  valueLabel,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  valueLabel: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-muted-foreground text-xs font-medium"
        >
          {label}
        </label>
        <span className="text-muted-foreground text-xs tabular-nums">
          {valueLabel}
        </span>
      </div>
      <Slider<number>
        id={id}
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) => {
          onChange(next);
        }}
      />
    </div>
  );
}
