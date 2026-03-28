import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { Loader, Upload } from "lucide-react";

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
import { toast } from "@acme/ui/toaster";

import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { useIsPending } from "~/hooks/use-is-pending";

export function PublishButton() {
  const { isPublishing, mutate, open, setOpen, draftId } = usePublishDraft();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="default" size="sm" className="w-full">
            <Upload className="size-3.5" />
            Publish
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish this draft?</DialogTitle>
          <DialogDescription>
            This will make the content live on your website immediately. If you
            just meant to save your work, no action is needed — your changes are
            already auto-saved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button disabled={isPublishing} onClick={() => mutate({ draftId })}>
            {isPublishing ? <Loader className="size-3.5 animate-spin" /> : null}
            Publish Live
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function usePublishDraft() {
  const [open, setOpen] = useState(false);
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const draftId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId/draft/$draftId",
    select: (ctx) => ctx.draftId,
  });
  const navigate = useNavigate();
  const pageMutations = usePageMutations();
  const isPublishing = useIsPending(pageMutations.publish.mutationKey);

  const { mutate } = useMutation({
    ...pageMutations.publish,
    onSuccess: () => {
      setOpen(false);
      toast.success("Draft published");
      void navigate({
        to: "/pages/$pageId",
        params: { pageId },
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to publish");
    },
  });

  return { isPublishing, mutate, open, setOpen, draftId };
}
