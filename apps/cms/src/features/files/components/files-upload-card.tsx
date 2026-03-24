import { FileUp, Loader, Upload } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Input } from "@acme/ui/input";

import { useFileUpload } from "~/features/files/hooks/use-file-upload";

export function FilesUploadCard() {
  const {
    selectedFile,
    inputKey,
    isUploading,
    handleFileChange,
    handleUpload,
  } = useFileUpload();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-4" />
          Upload a file
        </CardTitle>
        <CardDescription>
          Files uploaded here are shared across the CMS asset library and stored
          in Convex.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          key={inputKey}
          type="file"
          disabled={isUploading}
          onChange={(event) => {
            handleFileChange(event.target.files?.[0] ?? null);
          }}
        />
        <Button
          onClick={() => void handleUpload()}
          disabled={selectedFile === null || isUploading}
        >
          {isUploading ? (
            <>
              <Loader className="size-4 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <FileUp className="size-4" />
              Upload
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
