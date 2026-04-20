import { mutationOptions } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export function usePageMutations() {
  return {
    createPage: mutationOptions({
      mutationKey: ["page-create"],
      mutationFn: useConvexMutation(api.pages.manage.create),
    }),
    createNewDraft: mutationOptions({
      mutationKey: ["draft-create"],
      mutationFn: useConvexMutation(api.pages.drafts.createNew),
    }),
    saveDraft: mutationOptions({
      mutationKey: ["draft-save"],
      mutationFn: useConvexMutation(api.pages.drafts.save),
    }),
    renameDraft: mutationOptions({
      mutationKey: ["draft-rename"],
      mutationFn: useConvexMutation(api.pages.drafts.rename),
    }),
    publish: mutationOptions({
      mutationKey: ["page-publish"],
      mutationFn: useConvexMutation(api.pages.manage.publish),
    }),
    updatePageMetadata: mutationOptions({
      mutationKey: ["page-update-metadata"],
      mutationFn: useConvexMutation(api.pages.manage.updateMetadata),
    }),
    deleteDraft: mutationOptions({
      mutationKey: ["draft-delete"],
      mutationFn: useConvexMutation(api.pages.drafts.deleteDraft),
    }),
    scheduleDraft: mutationOptions({
      mutationKey: ["draft-schedule"],
      mutationFn: useConvexMutation(api.pages.scheduled.schedule),
    }),
    rescheduleDraft: mutationOptions({
      mutationKey: ["scheduled-reschedule"],
      mutationFn: useConvexMutation(api.pages.scheduled.reschedule),
    }),
    revertScheduledToDraft: mutationOptions({
      mutationKey: ["scheduled-revert"],
      mutationFn: useConvexMutation(api.pages.scheduled.revertToDraft),
    }),
  };
}
