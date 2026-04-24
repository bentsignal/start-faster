import { Activity } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { z } from "zod";

import { Input } from "@acme/ui/input";

import { FilePreviewModal } from "~/features/files/components/file-preview-modal";
import { FilesGridView } from "~/features/files/components/files-grid";
import { FilesListView } from "~/features/files/components/files-list";
import {
  defaultFilesViewMode,
  filesViewModeValidator,
  FilesViewToggle,
} from "~/features/files/components/files-view-toggle";
import { UploadButton } from "~/features/files/components/upload-button";
import {
  useFilePreview,
  useFilesIndex,
} from "~/features/files/hooks/use-files-index";
import { fileQueries } from "~/features/files/lib/file-queries";

export const Route = createFileRoute("/_authenticated/_authorized/files")({
  component: RouteComponent,
  validateSearch: z.object({
    view: filesViewModeValidator.default(defaultFilesViewMode),
    q: z.string().default(""),
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(fileQueries.list());
  },
});

function RouteComponent() {
  const {
    viewMode,
    setViewMode,
    searchValue,
    setSearchValue,
    debouncedSearch,
  } = useFilesIndex();
  const { target, openPreview, closePreview } = useFilePreview();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-8">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search files by name..."
            className="pl-9"
          />
        </div>
        <UploadButton />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Files</h2>
        <FilesViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      <Activity mode={viewMode === "grid" ? "visible" : "hidden"}>
        <FilesGridView searchTerm={debouncedSearch} onPreview={openPreview} />
      </Activity>
      <Activity mode={viewMode === "list" ? "visible" : "hidden"}>
        <FilesListView searchTerm={debouncedSearch} onPreview={openPreview} />
      </Activity>

      <FilePreviewModal
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) closePreview();
        }}
        url={target?.url ?? ""}
        fileName={target?.fileName ?? ""}
      />
    </div>
  );
}
