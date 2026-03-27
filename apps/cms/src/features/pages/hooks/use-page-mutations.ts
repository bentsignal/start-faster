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
    publish: mutationOptions({
      mutationKey: ["publish-page"],
      mutationFn: useConvexMutation(api.pages.publish),
    }),
  };
}
