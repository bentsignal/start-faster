import { mutationOptions } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export function usePageMutations() {
  return {
    createPage: mutationOptions({
      mutationKey: ["create-page"],
      mutationFn: useConvexMutation(api.pages.create),
    }),
    createNewDraft: mutationOptions({
      mutationKey: ["new-draft"],
      mutationFn: useConvexMutation(api.pages.createNewDraft),
    }),
    saveDraft: mutationOptions({
      mutationKey: ["save-draft"],
      mutationFn: useConvexMutation(api.pages.saveDraft),
    }),
    renameDraft: mutationOptions({
      mutationKey: ["rename-draft"],
      mutationFn: useConvexMutation(api.pages.renameDraft),
    }),
    publish: mutationOptions({
      mutationKey: ["publish-page"],
      mutationFn: useConvexMutation(api.pages.publish),
    }),
    updatePageMetadata: mutationOptions({
      mutationKey: ["update-page-metadata"],
      mutationFn: useConvexMutation(api.pages.updatePageMetadata),
    }),
    deleteDraft: mutationOptions({
      mutationKey: ["delete-draft"],
      mutationFn: useConvexMutation(api.pages.deleteDraft),
    }),
  };
}
