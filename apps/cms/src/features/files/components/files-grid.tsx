import { useState } from "react";

import type { PreviewTarget } from "~/features/files/hooks/use-files-index";
import type { FileRow } from "~/features/files/types";
import { Image } from "~/components/image";
import { useFilteredFiles } from "~/features/files/hooks/use-files-index";
import {
  formatFileSize,
  isImageContentType,
} from "~/features/files/lib/format";
import { FileActionsMenu } from "./file-actions-menu";
import { FileTypeIcon } from "./file-type-icon";

export function FilesGridView({
  searchTerm,
  onPreview,
}: {
  searchTerm: string;
  onPreview: (target: PreviewTarget) => void;
}) {
  const entries = useFilteredFiles(searchTerm);

  if (entries.length === 0) {
    return (
      <div className="text-muted-foreground px-1 py-8 text-sm">
        {searchTerm ? "No files match your search." : "No files yet."}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {entries.map(({ file, url }) => (
        <FileGridCard
          key={file._id}
          file={file}
          url={url}
          onPreview={() => {
            if (url) onPreview({ fileName: file.fileName, url });
          }}
        />
      ))}
    </div>
  );
}

export function FileGridCard({
  file,
  url,
  onPreview,
}: {
  file: FileRow;
  url: string | null;
  onPreview: () => void;
}) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const isImage = isImageContentType(file.contentType);
  const clickable = isImage && url !== null;

  return (
    <div
      className="group/file-tile border-border/60 bg-background flex flex-col overflow-hidden rounded-lg border transition-colors"
      data-menu-open={isMenuOpen || undefined}
    >
      <div className="bg-muted relative flex aspect-square items-center justify-center">
        <Thumbnail
          file={file}
          url={url}
          isImage={isImage}
          clickable={clickable}
          onPreview={onPreview}
        />
        <FileActionsMenu
          fileId={file._id}
          fileName={file.fileName}
          downloadUrl={url}
          placement="tile"
          isOpen={isMenuOpen}
          setOpen={setMenuOpen}
        />
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2">
        <span className="truncate text-sm font-medium">{file.fileName}</span>
        <span className="text-muted-foreground truncate text-xs">
          {formatFileSize(file.size)}
        </span>
      </div>
    </div>
  );
}

function Thumbnail({
  file,
  url,
  isImage,
  clickable,
  onPreview,
}: {
  file: FileRow;
  url: string | null;
  isImage: boolean;
  clickable: boolean;
  onPreview: () => void;
}) {
  if (isImage && url) {
    return (
      <button
        type="button"
        onClick={clickable ? onPreview : undefined}
        className="absolute inset-0 cursor-zoom-in outline-none"
        aria-label={`Preview ${file.fileName}`}
      >
        <Image
          src={url}
          alt={file.fileName}
          width={384}
          height={384}
          sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
          preserveSearch
          className="size-full object-cover"
        />
      </button>
    );
  }

  return (
    <FileTypeIcon
      contentType={file.contentType}
      className="text-muted-foreground size-10"
    />
  );
}
