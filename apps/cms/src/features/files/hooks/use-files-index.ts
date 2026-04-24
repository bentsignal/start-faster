import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

import type { FilesViewMode } from "~/features/files/components/files-view-toggle";
import { env } from "~/env";
import { fileQueries } from "~/features/files/lib/file-queries";
import { buildFileUrl, toConvexSiteUrl } from "~/features/files/lib/format";
import { useDebouncedInput } from "~/hooks/use-debounced-input";

const filesRoute = getRouteApi("/_authenticated/_authorized/files");
const convexSiteUrl = toConvexSiteUrl(env.VITE_CONVEX_URL);

function urlFor(downloadToken: string | undefined, fileName: string) {
  if (!downloadToken) return null;
  return buildFileUrl({ convexSiteUrl, downloadToken, fileName });
}

export function useFilesIndex() {
  const viewMode = filesRoute.useSearch({ select: (s) => s.view });
  const urlQuery = filesRoute.useSearch({ select: (s) => s.q });
  const navigate = filesRoute.useNavigate();

  async function setViewMode(next: FilesViewMode) {
    await navigate({
      search: (prev) => ({ ...prev, view: next }),
      replace: true,
    });
  }

  const {
    value: searchValue,
    setValue: setSearchValue,
    debouncedValue: debouncedSearch,
  } = useDebouncedInput({ initialValue: urlQuery });

  // eslint-disable-next-line no-restricted-syntax -- sync debounced input into URL search params
  useEffect(() => {
    void navigate({
      search: (prev) => ({ ...prev, q: debouncedSearch || undefined }),
      replace: true,
    });
  }, [debouncedSearch, navigate]);

  return {
    viewMode,
    setViewMode,
    searchValue,
    setSearchValue,
    debouncedSearch,
  };
}

export function useFilteredFiles(searchTerm: string) {
  const { data: files } = useSuspenseQuery({
    ...fileQueries.list(),
    select: (data) =>
      data.map((file) => ({
        _id: file._id,
        fileName: file.fileName,
        contentType: file.contentType,
        size: file.size,
        _creationTime: file._creationTime,
        downloadToken: file.downloadToken,
        uploadedBy: file.uploadedBy
          ? { name: file.uploadedBy.name, email: file.uploadedBy.email }
          : null,
      })),
  });

  const needle = searchTerm.trim().toLowerCase();
  const filtered = needle
    ? files.filter((file) => file.fileName.toLowerCase().includes(needle))
    : files;

  return filtered.map((file) => ({
    file,
    url: urlFor(file.downloadToken, file.fileName),
  }));
}

export interface PreviewTarget {
  fileName: string;
  url: string;
}

export function useFilePreview() {
  const [target, setTarget] = useState<PreviewTarget | null>(null);
  return {
    target,
    openPreview: (next: PreviewTarget) => setTarget(next),
    closePreview: () => setTarget(null),
  };
}
