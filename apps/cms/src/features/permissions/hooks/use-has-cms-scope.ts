import { useSuspenseQuery } from "@tanstack/react-query";

import type { CmsScope } from "@acme/convex/types";
import { hasCmsScopeOrAdmin } from "@acme/convex/privileges";

import { userQueries } from "~/lib/user-queries";

export function useHasCmsScope(scope: CmsScope) {
  const { data } = useSuspenseQuery({
    ...userQueries.currentUser(),
    select: (user) => hasCmsScopeOrAdmin(user, scope),
  });
  return data;
}
