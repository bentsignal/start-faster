import { queryOptions } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

import type { Id } from "@acme/convex/model";
import { api } from "@acme/convex/api";

export const shopQueries = {
  getByPath: (path: string) =>
    queryOptions({ ...convexQuery(api.pages.manage.getByPath, { path }) }),
  getDraftPreview: (draftId: Id<"pageDrafts">) =>
    queryOptions({
      ...convexQuery(api.pages.drafts.getPreview, { draftId }),
    }),
};
