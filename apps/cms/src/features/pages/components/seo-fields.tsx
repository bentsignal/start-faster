import { Textarea } from "@acme/ui/textarea";

import type { ImagePickerSelection } from "./image-picker-dialog";
import type { SeoImageValue } from "./seo-image-picker";
import { SeoImagePicker } from "./seo-image-picker";

export function SeoFields({
  seoDescription,
  setSeoDescription,
  seoImage,
  onImageSelect,
  onImageRemove,
  onImageAltChange,
  canEdit,
}: {
  seoDescription: string;
  setSeoDescription: (value: string) => void;
  seoImage: SeoImageValue | null;
  onImageSelect: (selection: ImagePickerSelection) => void;
  onImageRemove: () => void;
  onImageAltChange: (alt: string) => void;
  canEdit: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">SEO</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Customize how this page appears in search engines and social media.
        </p>
      </div>
      <div className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="seo-description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="seo-description"
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            placeholder="A short summary of this page for search engines"
            disabled={!canEdit}
            maxLength={160}
          />
          <p className="text-muted-foreground text-xs">
            {seoDescription.length}/160 characters
          </p>
        </div>
        <SeoImagePicker
          value={seoImage}
          onSelect={onImageSelect}
          onRemove={onImageRemove}
          onAltChange={onImageAltChange}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
