import { useState } from "react";
import { ImageIcon, ImagePlus, X } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import type { ImagePickerSelection } from "./image-picker-dialog";
import { Image } from "~/components/image";
import { env } from "~/env";
import { buildFileUrl, toConvexSiteUrl } from "~/features/files/lib/format";
import { ImagePickerDialog } from "./image-picker-dialog";

const convexSiteUrl = toConvexSiteUrl(env.VITE_CONVEX_URL);

export interface SeoImageValue {
  fileId: Id<"files">;
  downloadToken: string;
  fileName: string;
  alt: string;
}

export function SeoImagePicker({
  value,
  onSelect,
  onRemove,
  onAltChange,
  canEdit,
}: {
  value: SeoImageValue | null;
  onSelect: (selection: ImagePickerSelection) => void;
  onRemove: () => void;
  onAltChange: (alt: string) => void;
  canEdit: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Social Image</span>
      {value ? (
        <SeoImagePreview
          image={value}
          onReplace={() => setPickerOpen(true)}
          onRemove={onRemove}
          onAltChange={onAltChange}
          canEdit={canEdit}
        />
      ) : (
        <SeoImageEmpty onChoose={() => setPickerOpen(true)} canEdit={canEdit} />
      )}
      <p className="text-muted-foreground text-xs">
        Displayed when this page is shared on social media.
      </p>
      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(selection) => {
          onSelect(selection);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}

function SeoImageEmpty({
  onChoose,
  canEdit,
}: {
  onChoose: () => void;
  canEdit: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChoose}
      disabled={!canEdit}
      className="border-border bg-muted/30 hover:border-foreground/40 hover:bg-muted/50 focus-visible:ring-ring flex items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-5 text-left transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
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

function SeoImagePreview({
  image,
  onReplace,
  onRemove,
  onAltChange,
  canEdit,
}: {
  image: SeoImageValue;
  onReplace: () => void;
  onRemove: () => void;
  onAltChange: (alt: string) => void;
  canEdit: boolean;
}) {
  const url = buildFileUrl({
    convexSiteUrl,
    downloadToken: image.downloadToken,
    fileName: image.fileName,
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-lg">
        <Image
          src={url}
          alt={image.alt || image.fileName}
          width={1200}
          height={630}
          sizes="(min-width: 768px) 600px, 100vw"
          preserveSearch
          className="h-auto w-full rounded-md object-cover"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground truncate text-xs">
          {image.fileName}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRemove}
            disabled={!canEdit}
            className="gap-1.5"
          >
            <X className="size-3.5" />
            Remove
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onReplace}
            disabled={!canEdit}
            className="gap-1.5"
          >
            <ImagePlus className="size-3.5" />
            Replace
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="seo-image-alt"
          className="text-muted-foreground text-xs font-medium"
        >
          Alt text
        </label>
        <Input
          id="seo-image-alt"
          value={image.alt}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Describe the image for accessibility"
          disabled={!canEdit}
        />
      </div>
    </div>
  );
}
