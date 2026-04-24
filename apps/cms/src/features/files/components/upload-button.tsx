import { Loader, Upload } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { useFileUpload } from "~/features/files/hooks/use-file-upload";

export function UploadButton() {
  const { inputRef, isUploading, triggerPicker, uploadSelected } =
    useFileUpload();

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                aria-label="Upload a new file"
                onClick={triggerPicker}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
              </Button>
            }
          />
          <TooltipContent>Upload a new file</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadSelected(file);
        }}
      />
    </>
  );
}
