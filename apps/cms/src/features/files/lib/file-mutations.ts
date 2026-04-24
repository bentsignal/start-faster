import { mutationOptions } from "@tanstack/react-query";
import { useConvexMutation } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export function useFileMutations() {
  return {
    rename: mutationOptions({
      mutationKey: ["file-rename"],
      mutationFn: useConvexMutation(api.files.rename),
    }),
    remove: mutationOptions({
      mutationKey: ["file-remove"],
      mutationFn: useConvexMutation(api.files.remove),
    }),
  };
}
