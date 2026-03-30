import { mutationOptions } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export function usePageMutations() {
  return {
    createPage: mutationOptions({
      mutationKey: ["create-page"],
      mutationFn: useConvexMutation(api.pages.manage.create),
    }),
    createNewDraft: mutationOptions({
      mutationKey: ["new-draft"],
      mutationFn: useConvexMutation(api.pages.drafts.createNew),
    }),
    saveDraft: mutationOptions({
      mutationKey: ["save-draft"],
      mutationFn: useConvexMutation(api.pages.drafts.save),
    }),
    renameDraft: mutationOptions({
      mutationKey: ["rename-draft"],
      mutationFn: useConvexMutation(api.pages.drafts.rename),
    }),
    publish: mutationOptions({
      mutationKey: ["publish-page"],
      mutationFn: useConvexMutation(api.pages.manage.publish),
    }),
    updatePageMetadata: mutationOptions({
      mutationKey: ["update-page-metadata"],
      mutationFn: useConvexMutation(api.pages.manage.updateMetadata),
    }),
    deleteDraft: mutationOptions({
      mutationKey: ["delete-draft"],
      mutationFn: useConvexMutation(api.pages.drafts.deleteDraft),
    }),
  };
}
