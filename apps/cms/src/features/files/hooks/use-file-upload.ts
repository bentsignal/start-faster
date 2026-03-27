import { useState } from "react";
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("Choose a file before uploading.");
      return;
    }

    setIsUploading(true);

    const authToken = (await getAccessToken()) ?? null;
    if (!authToken) {
      toast.error("Failed to upload file");
      setIsUploading(false);
      return;
    }

    try {
      await uploadFile({
        file: selectedFile,
        http: {
          baseUrl: convexSiteUrl,
          authToken,
        },
      });

      setSelectedFile(null);
      setInputKey((value) => value + 1);
      toast.success("File uploaded.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file");
    }

    setIsUploading(false);
  }

  return {
    selectedFile,
    inputKey,
    isUploading,
    handleFileChange: setSelectedFile,
    handleUpload,
  };
}
