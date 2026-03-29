import { useState } from "react";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { Loader, Pencil } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toaster";

import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { pageQueries } from "~/features/pages/lib/page-queries";
import { useIsPending } from "~/hooks/use-is-pending";

export function RenameDraftButton() {
  const { open, onOpenChange, draftName, name, setName, isRenaming, submit } =
    useRenameDraftButton();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground w-full justify-start gap-2"
          >
            <Pencil className="size-3.5 shrink-0" />
            <span className="min-w-0 truncate">{draftName}</span>
          </Button>
        }
      />
      {open ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Draft</DialogTitle>
            <DialogDescription>
              Give this draft a name to help identify it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <label htmlFor="draft-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              autoFocus
              id="draft-name"
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
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

function useRenameDraftButton() {
  const [open, setOpen] = useState(false);

  const draftId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
    select: (ctx) => ctx.draftId,
  });

  const { data: draft } = useSuspenseQuery({
    ...pageQueries.getDraft(draftId),
    select: (data) => ({ name: data.name }),
  });

  const [name, setName] = useState(draft.name);

  const pageMutations = usePageMutations();
  const isRenaming = useIsPending(pageMutations.renameDraft.mutationKey);

  const { mutate } = useMutation({
    ...pageMutations.renameDraft,
    onSuccess: () => {
      setOpen(false);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to rename draft",
      );
    },
  });

  const submit = () => {
    const trimmed = name.trim();
    if (trimmed) mutate({ draftId, name: trimmed });
  };

  const onOpenChange = (next: boolean) => {
    if (next) setName(draft.name);
    setOpen(next);
  };

  return {
    open,
    onOpenChange,
    draftName: draft.name,
    name,
    setName,
    isRenaming,
    submit,
  };
}
