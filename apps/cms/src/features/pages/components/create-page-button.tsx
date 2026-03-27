import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader, Plus, RotateCcw } from "lucide-react";

import { Button } from "@acme/ui/button";

import { usePageMutations } from "~/features/pages/hooks/use-page-mutations";
import { useIsPending } from "~/hooks/use-is-pending";

export function CreatePageButton() {
  const { createPage, isCreating, isError } = useCreatePage();

  return (
    <Button
      onClick={createPage}
      disabled={isCreating}
      variant={isError ? "destructive" : "default"}
    >
      {isCreating ? (
        <Loader className="size-4 animate-spin" />
      ) : isError ? (
        <>
          <RotateCcw className="size-4" />
          Failed to create page, try again
        </>
      ) : (
        <>
          <Plus className="size-4" />
          Create Page
        </>
      )}
    </Button>
  );
}

function useCreatePage() {
  const navigate = useNavigate();
  const pageMutations = usePageMutations();
  const { mutate, isError } = useMutation({
    ...pageMutations.createPage,
    onSuccess: (data) => {
      void navigate({
        to: "/pages/$pageId",
        params: { pageId: data.pageId },
        search: {},
      });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const isCreating = useIsPending(pageMutations.createPage.mutationKey);
  function createPage() {
    mutate({});
  }
  return { createPage, isCreating, isError };
}
