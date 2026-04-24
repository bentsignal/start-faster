import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader, Plus, RotateCcw } from "lucide-react";

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

import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { RestrictedTooltip } from "~/features/permissions/components/restricted-tooltip";
import { useHasCmsScope } from "~/features/permissions/hooks/use-has-cms-scope";
import { useIsPending } from "~/hooks/use-is-pending";

export function CreatePageButton() {
  const [open, setOpen] = useState(false);
  const canCreate = useHasCmsScope("can-create-new-pages");

  if (!canCreate) {
    return (
      <RestrictedTooltip scope="can-create-new-pages">
        <Button size="icon" aria-label="Create Page" disabled>
          <Plus className="size-4" />
        </Button>
      </RestrictedTooltip>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="icon" aria-label="Create Page">
            <Plus className="size-4" />
          </Button>
        }
      />
      <DialogContent>
        <CreatePageForm closeModal={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function useCreatePageForm(closeModal: () => void) {
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("/");
  const navigate = useNavigate();
  const pageMutations = usePageMutations();

  const { mutate, isError } = useMutation({
    ...pageMutations.createPage,
    onSuccess: (data) => {
      closeModal();
      void navigate({
        to: "/pages/$pageId",
        params: { pageId: data.pageId },
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const isPending = useIsPending(pageMutations.createPage.mutationKey);

  return {
    title,
    setTitle,
    path,
    setPath,
    isPending,
    isError,
    submit: () => mutate({ title, path }),
  };
}

function CreatePageForm({ closeModal }: { closeModal: () => void }) {
  const form = useCreatePageForm(closeModal);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.submit();
      }}
    >
      <DialogHeader>
        <DialogTitle>Create Page</DialogTitle>
        <DialogDescription>
          Set the title and URL path for your new page.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 pt-6 pb-9">
        <div className="space-y-2">
          <label
            htmlFor="new-page-title"
            className="text-sm leading-none font-medium"
          >
            Title
          </label>
          <Input
            id="new-page-title"
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
            placeholder="About Us"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="new-page-path"
            className="text-sm leading-none font-medium"
          >
            URL Path
          </label>
          <Input
            id="new-page-path"
            value={form.path}
            onChange={(e) => form.setPath(e.target.value)}
            placeholder="/about"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose
          render={
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          }
        />
        <Button
          type="submit"
          disabled={form.isPending || !form.title.trim()}
          variant={form.isError ? "destructive" : "default"}
          className="flex-1"
        >
          {form.isPending ? (
            <Loader className="size-4 animate-spin" />
          ) : form.isError ? (
            <>
              {" "}
              <RotateCcw className="size-4" /> Failed to create page, try again
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Create
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
