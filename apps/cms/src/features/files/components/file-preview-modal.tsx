import { XIcon } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@acme/ui/dialog";

import { Image } from "~/components/image";

export function FilePreviewModal({
  open,
  onOpenChange,
  url,
  fileName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  fileName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] items-center justify-center gap-0 overflow-hidden rounded-none border-0 bg-transparent p-4 ring-0 sm:max-w-[100vw] sm:p-10"
      >
        <DialogTitle className="sr-only">{fileName}</DialogTitle>
        <DialogDescription className="sr-only">
          Full-size preview of {fileName}
        </DialogDescription>
        <Image
          src={url}
          alt={fileName}
          width={2560}
          height={2560}
          sizes="100vw"
          preserveSearch
          className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] object-contain sm:max-h-[calc(100dvh-5rem)] sm:max-w-[calc(100vw-5rem)]"
        />
        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4 bg-black/40 text-white hover:bg-black/60 hover:text-white"
            />
          }
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
