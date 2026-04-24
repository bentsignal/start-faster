import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, Ellipsis, Pencil, Trash2 } from "lucide-react";

import type { Id } from "@acme/convex/model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { toast } from "@acme/ui/toaster";

import { useFileMutations } from "~/features/files/lib/file-mutations";
import { DeleteConfirmation } from "~/features/pages/components/delete-draft-button";
import { FileRenameDialog } from "./file-rename-dialog";

type Placement = "row" | "tile";

interface FileActionsMenuProps {
  fileId: Id<"files">;
  fileName: string;
  downloadUrl: string | null;
  placement: Placement;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const ROW_TRIGGER_CLASS =
  "text-muted-foreground hover:text-foreground hover:bg-muted flex size-7 cursor-pointer items-center justify-center rounded-md opacity-0 transition-all group-hover/file-row:opacity-100 group-data-[menu-open]/file-row:opacity-100 data-popup-open:opacity-100";

const TILE_TRIGGER_CLASS =
  "absolute top-2 right-2 z-10 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-all group-hover/file-tile:opacity-100 group-data-[menu-open]/file-tile:opacity-100 hover:bg-black/70 data-popup-open:opacity-100";

function useFileActionsMenu({
  fileId,
  setOpen,
}: {
  fileId: Id<"files">;
  setOpen: (open: boolean) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const fileMutations = useFileMutations();
  const { mutate: remove, isPending: isDeletePending } = useMutation({
    ...fileMutations.remove,
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete file",
      );
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) setConfirming(false);
  }

  function handleRename() {
    setOpen(false);
    setRenameOpen(true);
  }

  function handleConfirmDelete() {
    setOpen(false);
    remove({ fileId });
  }

  return {
    handleOpenChange,
    confirming,
    startConfirming: () => setConfirming(true),
    cancelConfirming: () => setConfirming(false),
    isDeletePending,
    handleRename,
    handleConfirmDelete,
    renameOpen,
    setRenameOpen,
  };
}

export function FileActionsMenu(props: FileActionsMenuProps) {
  const { fileId, fileName, downloadUrl, placement, isOpen, setOpen } = props;
  const actions = useFileActionsMenu({ fileId, setOpen });
  const triggerClass =
    placement === "row" ? ROW_TRIGGER_CLASS : TILE_TRIGGER_CLASS;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={actions.handleOpenChange}>
        <DropdownMenuTrigger aria-label="File actions" className={triggerClass}>
          <Ellipsis className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={4}
          className="w-56"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={actions.handleRename}
              className="hover:cursor-pointer"
            >
              <Pencil className="size-3.5" />
              Rename
            </DropdownMenuItem>
            {downloadUrl ? (
              <DropdownMenuItem
                closeOnClick={false}
                onClick={() => {
                  window.open(downloadUrl, "_blank", "noopener,noreferrer");
                  actions.handleOpenChange(false);
                }}
                className="hover:cursor-pointer"
              >
                <Download className="size-3.5" />
                Download
              </DropdownMenuItem>
            ) : null}
            {actions.confirming ? (
              <DeleteConfirmation
                onConfirm={actions.handleConfirmDelete}
                onCancel={actions.cancelConfirming}
                disabled={actions.isDeletePending}
              />
            ) : (
              <DropdownMenuItem
                variant="destructive"
                closeOnClick={false}
                onClick={actions.startConfirming}
                className="hover:cursor-pointer"
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <FileRenameDialog
        open={actions.renameOpen}
        onOpenChange={actions.setRenameOpen}
        fileId={fileId}
        initialName={fileName}
      />
    </>
  );
}
