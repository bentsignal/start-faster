import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";

import { validatePath } from "@acme/convex/page-utils";
import { toast } from "@acme/ui/toaster";

import type { ImagePickerSelection } from "~/features/pages/components/image-picker-dialog";
import type { SeoImageValue } from "~/features/pages/components/seo-image-picker";
import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { pageQueries } from "~/features/pages/lib/page-queries";
import { useIsPending } from "~/hooks/use-is-pending";

function useSeoFields(page: {
  seoDescription?: string;
  seoImage?: SeoImageValue;
}) {
  const [seoDescription, setSeoDescription] = useState(
    page.seoDescription ?? "",
  );
  const [seoImage, setSeoImageRaw] = useState<SeoImageValue | null>(
    page.seoImage ?? null,
  );
  const [imageCleared, setImageCleared] = useState(false);

  function handleImageSelect(selection: ImagePickerSelection) {
    setSeoImageRaw({
      fileId: selection.fileId,
      downloadToken: selection.downloadToken,
      fileName: selection.fileName,
      alt: seoImage?.alt ?? "",
    });
    setImageCleared(false);
  }

  function handleImageRemove() {
    setSeoImageRaw(null);
    setImageCleared(true);
  }

  function handleImageAltChange(alt: string) {
    if (!seoImage) return;
    setSeoImageRaw({ ...seoImage, alt });
  }

  const hasChanges =
    seoDescription !== (page.seoDescription ?? "") ||
    seoImage !== (page.seoImage ?? null) ||
    imageCleared;

  function toMutationArgs() {
    if (imageCleared && !seoImage) {
      return { seoDescription, seoImage: null };
    }
    if (seoImage) {
      return { seoDescription, seoImage };
    }
    return { seoDescription };
  }

  return {
    seoDescription,
    setSeoDescription,
    seoImage,
    handleImageSelect,
    handleImageRemove,
    handleImageAltChange,
    hasChanges,
    toMutationArgs,
  };
}

export function usePageSettings() {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });

  const { data: page } = useSuspenseQuery({
    ...pageQueries.getById(pageId),
    select: (data) => ({
      _id: data._id,
      title: data.title,
      path: data.path,
      seoDescription: data.seoDescription,
      seoImage: data.seoImage,
    }),
  });

  const [title, setTitle] = useState(page.title);
  const [path, setPath] = useState(page.path);
  const [pathError, setPathError] = useState<string | null>(null);
  const seo = useSeoFields(page);
  const pageMutations = usePageMutations();

  const { mutate, isError } = useMutation({
    ...pageMutations.updatePageMetadata,
    onSuccess: () => {
      toast.success("Page settings updated");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const isPending = useIsPending(pageMutations.updatePageMetadata.mutationKey);

  const hasChanges =
    title !== page.title || path !== page.path || seo.hasChanges;

  function validatePathField() {
    const result = validatePath(path);
    if (result.status === "invalid") {
      setPathError(result.error);
      return false;
    }
    setPathError(null);
    return true;
  }

  return {
    pageId: page._id,
    title,
    setTitle,
    path,
    setPath: (value: string) => {
      setPath(value);
      if (pathError) setPathError(null);
    },
    pathError,
    validatePathField,
    ...seo,
    isPending,
    isError,
    hasChanges,
    submit: () => {
      if (!validatePathField()) return;
      mutate({ pageId: page._id, title, path, ...seo.toMutationArgs() });
    },
  };
}
