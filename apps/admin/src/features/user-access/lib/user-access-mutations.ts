import type { AdminLevel, CmsScopes } from "@acme/convex/types";
import { api } from "@acme/convex/api";

import { patchUserInSearchResults } from "~/features/user-access/lib/optimistic-update-utils";

export const userAccessMutations = {
  updateAdminLevel: {
    convexMutation: api.users.updateUserAdminLevel,
    optimisticUpdate: (
      localStore: Parameters<typeof patchUserInSearchResults>[0],
      args: { userId: string; adminLevel: AdminLevel },
    ) => {
      patchUserInSearchResults(localStore, args.userId, {
        adminLevel: args.adminLevel,
      });
    },
  },
  updateCmsScopes: {
    convexMutation: api.users.updateUserCmsScopes,
    optimisticUpdate: (
      localStore: Parameters<typeof patchUserInSearchResults>[0],
      args: { userId: string; cmsScopes: CmsScopes },
    ) => {
      patchUserInSearchResults(localStore, args.userId, {
        cmsScopes: args.cmsScopes,
      });
    },
  },
  revokeAllPermissions: {
    convexMutation: api.users.revokeAllPermissions,
    optimisticUpdate: (
      localStore: Parameters<typeof patchUserInSearchResults>[0],
      args: { userId: string },
    ) => {
      patchUserInSearchResults(localStore, args.userId, {
        adminLevel: 0,
        cmsScopes: [],
      });
    },
  },
};
