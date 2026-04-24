import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";

import type { Id } from "@acme/convex/model";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toaster";

import { useFileMutations } from "~/features/files/lib/file-mutations";
import { useIsPending } from "~/hooks/use-is-pending";

function useFileRename({
  fileId,
  initialName,
  onClose,
}: {
  fileId: Id<"files">;
  initialName: string;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialName);

  const fileMutations = useFileMutations();
  const isRenaming = useIsPending(fileMutations.rename.mutationKey);

  const { mutate } = useMutation({
    ...fileMutations.rename,
    onSuccess: () => {
      onClose();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to rename file",
      );
    },
  });

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed) mutate({ fileId, fileName: trimmed });
  };

  return { name, setName, isRenaming, submit };
}

export function FileRenameDialog({
  open,
  onOpenChange,
  fileId,
  initialName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileId: Id<"files">;
  initialName: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent>
          <RenameForm
            fileId={fileId}
            initialName={initialName}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function RenameForm({
  fileId,
  initialName,
  onClose,
}: {
  fileId: Id<"files">;
  initialName: string;
  onClose: () => void;
}) {
  const { name, setName, isRenaming, submit } = useFileRename({
    fileId,
    initialName,
    onClose,
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Rename file</DialogTitle>
        <DialogDescription>Update the file&apos;s name.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-2 py-2">
        <label htmlFor="file-name" className="text-sm font-medium">
          Name
        </label>
        <Input
          autoFocus
          id="file-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button disabled={isRenaming || !name.trim()} onClick={submit}>
          {isRenaming ? <Loader className="size-3.5 animate-spin" /> : null}
          Save
        </Button>
      </DialogFooter>
    </>
  );
}
