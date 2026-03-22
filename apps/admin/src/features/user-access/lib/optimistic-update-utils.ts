import type { useMutation as useConvexMutation } from "convex/react";

import type { Doc } from "@acme/convex/model";
import { api } from "@acme/convex/api";

export type ConvexOptimisticLocalStore = Parameters<
  Parameters<ReturnType<typeof useConvexMutation>["withOptimisticUpdate"]>[0]
>[0];

export function patchUserInSearchResults(
  localStore: ConvexOptimisticLocalStore,
  userId: string,
  patch: Partial<Pick<Doc<"users">, "adminLevel" | "cmsScopes">>,
) {
  const results = localStore.getAllQueries(api.users.searchUsersPaginated);
  for (const result of results) {
    if (result.value === undefined) continue;
    const hasTargetUser = result.value.page.some((user) => user._id === userId);
    if (!hasTargetUser) continue;
    localStore.setQuery(
      api.users.searchUsersPaginated,
      {
        searchTerm: result.args.searchTerm,
        paginationOpts: result.args.paginationOpts,
      },
      {
        ...result.value,
        page: result.value.page.map((user) =>
          user._id === userId ? { ...user, ...patch } : user,
        ),
      },
    );
  }

  const userQueries = localStore.getAllQueries(api.users.getUserById);
  for (const result of userQueries) {
    if (result.value === undefined) continue;
    if (result.args.userId !== userId) continue;
    localStore.setQuery(api.users.getUserById, result.args, {
      ...result.value,
      ...patch,
    });
  }
}
