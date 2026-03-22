import { useMutation as useConvexMutation } from "convex/react";

import { userAccessMutations } from "~/features/user-access/lib/user-access-mutations";

export function useUpdateAdminLevel() {
  const { convexMutation, optimisticUpdate } =
    userAccessMutations.updateAdminLevel;
  return useConvexMutation(convexMutation).withOptimisticUpdate(
    optimisticUpdate,
  );
}

export function useUpdateCmsScopes() {
  const { convexMutation, optimisticUpdate } =
    userAccessMutations.updateCmsScopes;
  return useConvexMutation(convexMutation).withOptimisticUpdate(
    optimisticUpdate,
  );
}

export function useRevokeAllPermissions() {
  const { convexMutation, optimisticUpdate } =
    userAccessMutations.revokeAllPermissions;
  return useConvexMutation(convexMutation).withOptimisticUpdate(
    optimisticUpdate,
  );
}
