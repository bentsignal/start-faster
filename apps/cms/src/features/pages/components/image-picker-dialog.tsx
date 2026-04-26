import { useSuspenseQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";

import type { Id } from "@acme/convex/model";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";

import { Image } from "~/components/image";
import { env } from "~/env";
import { UploadButton } from "~/features/files/components/upload-button";
import { fileQueries } from "~/features/files/lib/file-queries";
import {
  buildFileUrl,
  isImageContentType,
  toConvexSiteUrl,
} from "~/features/files/lib/format";

const convexSiteUrl = toConvexSiteUrl(env.VITE_CONVEX_URL);

export interface ImagePickerSelection {
  fileId: Id<"files">;
  downloadToken: string;
  fileName: string;
}

export function ImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selection: ImagePickerSelection) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-10">
            <div className="flex flex-col gap-1">
              <DialogTitle>Select image</DialogTitle>
              <DialogDescription>
                Pick an image from the library, or upload a new one.
              </DialogDescription>
            </div>
            <UploadButton />
          </div>
        </DialogHeader>

        <ImageGrid
          onSelect={(selection) => {
            onSelect(selection);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function useImagePickerEntries() {
  const { data } = useSuspenseQuery({
    ...fileQueries.list(),
    select: (files) =>
      files
        .filter((file) => isImageContentType(file.contentType))
        .map((file) => ({
          _id: file._id,
          fileName: file.fileName,
          downloadToken: file.downloadToken,
          url: file.downloadToken
            ? buildFileUrl({
                convexSiteUrl,
                downloadToken: file.downloadToken,
                fileName: file.fileName,
              })
            : null,
        })),
  });
  return data;
}

function ImageGrid({
  onSelect,
}: {
  onSelect: (selection: ImagePickerSelection) => void;
}) {
  const entries = useImagePickerEntries();

  if (entries.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-2 px-1 py-12 text-sm">
        <ImageOff className="size-6" />
        No images uploaded yet.
      </div>
    );
  }

  return (
    <div className="-mx-1 grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto px-1 sm:grid-cols-3 md:grid-cols-4">
      {entries.map((entry) => (
        <ImageGridTile
          key={entry._id}
          entry={entry}
          onSelect={() => {
            if (!entry.downloadToken || !entry.url) return;
            onSelect({
              fileId: entry._id,
              downloadToken: entry.downloadToken,
              fileName: entry.fileName,
            });
          }}
        />
      ))}
    </div>
  );
}

function ImageGridTile({
  entry,
  onSelect,
}: {
  entry: { _id: Id<"files">; fileName: string; url: string | null };
  onSelect: () => void;
}) {
  const disabled = entry.url === null;
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className="group/image-tile border-border/60 bg-background hover:border-foreground/40 focus-visible:ring-ring flex flex-col overflow-hidden rounded-lg border text-left transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="bg-muted relative flex aspect-square items-center justify-center">
        {entry.url ? (
          <Image
            src={entry.url}
            alt={entry.fileName}
            width={256}
            height={256}
            sizes="(min-width: 768px) 25vw, 50vw"
            preserveSearch
            className="size-full object-cover"
          />
        ) : (
          <ImageOff className="text-muted-foreground size-6" />
        )}
      </div>
      <span className="truncate px-2 py-1.5 text-xs">{entry.fileName}</span>
    </button>
  );
}
