import { useRef, useState } from "react";
import { useAccessToken } from "@workos/authkit-tanstack-react-start/client";

import { api } from "@acme/convex/api";
import { useUploadFile } from "@acme/files/react";
import { toast } from "@acme/ui/toaster";

import { env } from "~/env";
import { toConvexSiteUrl } from "~/features/files/lib/format";

const convexSiteUrl = toConvexSiteUrl(env.VITE_CONVEX_URL);

const uploadFileOptions = {
  method: "http" as const,
  provider: "convex" as const,
  http: {
    baseUrl: convexSiteUrl,
  },
};

export function useFileUpload() {
  const { getAccessToken } = useAccessToken();
  const { uploadFile } = useUploadFile(api.files, uploadFileOptions);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  function triggerPicker() {
    inputRef.current?.click();
  }

  async function uploadSelected(file: File) {
    setIsUploading(true);

    const authToken = (await getAccessToken()) ?? null;
    if (!authToken) {
      toast.error("Failed to upload file");
      setIsUploading(false);
      return;
    }

    try {
      await uploadFile({
        file,
        http: {
          baseUrl: convexSiteUrl,
          authToken,
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setIsUploading(false);
  }

  return { inputRef, isUploading, triggerPicker, uploadSelected };
}
