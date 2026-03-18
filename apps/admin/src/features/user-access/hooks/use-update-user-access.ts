import { useMutation as useConvexMutation } from "convex/react";

import { api } from "@acme/convex/api";

export function useUpdateUserAccess() {
  return useConvexMutation(
    api.users.updateUserAccessLevel,
  ).withOptimisticUpdate((localStore, args) => {
    const results = localStore.getAllQueries(api.users.searchUsersPaginated);

    for (const result of results) {
      if (result.value === undefined) {
        continue;
      }

      const hasTargetUser = result.value.page.some(
        (user) => user._id === args.userId,
      );
      if (!hasTargetUser) {
        continue;
      }

      localStore.setQuery(
        api.users.searchUsersPaginated,
        {
          searchTerm: result.args.searchTerm,
          paginationOpts: result.args.paginationOpts,
        },
        {
          ...result.value,
          page: result.value.page.map((user) =>
            user._id === args.userId
              ? { ...user, accessLevel: args.accessLevel }
              : user,
          ),
        },
      );
    }
  });
}
