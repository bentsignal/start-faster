import { useState } from "react";

import type { PreviewTarget } from "~/features/files/hooks/use-files-index";
import type { FileRow } from "~/features/files/types";
import { Image } from "~/components/image";
import { useFilteredFiles } from "~/features/files/hooks/use-files-index";
import {
  formatDate,
  formatFileSize,
  isImageContentType,
} from "~/features/files/lib/format";
import { FileActionsMenu } from "./file-actions-menu";
import { FileTypeIcon } from "./file-type-icon";

export function FilesListView({
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
    <ul className="flex flex-col gap-1.5">
      {entries.map(({ file, url }) => (
        <li key={file._id}>
          <FileListRow
            file={file}
            url={url}
            onPreview={() => {
              if (url) onPreview({ fileName: file.fileName, url });
            }}
          />
        </li>
      ))}
    </ul>
  );
}

const CONTENT_CLASS =
  "flex min-w-0 flex-1 items-center gap-3 rounded-md text-left outline-none";

export function FileListRow({
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
      className="group/file-row border-border/60 bg-background hover:bg-muted/50 relative flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors"
      data-menu-open={isMenuOpen || undefined}
    >
      {clickable ? (
        <button
          type="button"
          className={`${CONTENT_CLASS} cursor-zoom-in`}
          onClick={onPreview}
        >
          <RowInner file={file} url={url} isImage={isImage} />
        </button>
      ) : (
        <div className={CONTENT_CLASS}>
          <RowInner file={file} url={url} isImage={isImage} />
        </div>
      )}
      <FileActionsMenu
        fileId={file._id}
        fileName={file.fileName}
        downloadUrl={url}
        placement="row"
        isOpen={isMenuOpen}
        setOpen={setMenuOpen}
      />
    </div>
  );
}

function RowInner({
  file,
  url,
  isImage,
}: {
  file: FileRow;
  url: string | null;
  isImage: boolean;
}) {
  return (
    <>
      <div className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md">
        {isImage && url ? (
          <Image
            src={url}
            alt={file.fileName}
            width={40}
            height={40}
            preserveSearch
            className="size-full object-cover"
          />
        ) : (
          <FileTypeIcon
            contentType={file.contentType}
            className="text-muted-foreground size-4"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{file.fileName}</span>
        <span className="text-muted-foreground truncate text-xs">
          {formatFileSize(file.size)} · {formatDate(file._creationTime)}
        </span>
      </div>
    </>
  );
}
