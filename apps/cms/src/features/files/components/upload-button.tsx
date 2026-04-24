import { Loader, Upload } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import { useFileUpload } from "~/features/files/hooks/use-file-upload";
import { RestrictedTooltip } from "~/features/permissions/components/restricted-tooltip";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";

export function UploadButton() {
  const canUpload = useHasCmsScope("can-upload-files");

  if (!canUpload) {
    return (
      <RestrictedTooltip scope="can-upload-files">
        <Button size="icon" aria-label="Upload a new file" disabled>
          <Upload className="size-4" />
        </Button>
      </RestrictedTooltip>
    );
  }

  return <UploadButtonInner />;
}

function UploadButtonInner() {
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
