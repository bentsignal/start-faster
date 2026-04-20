import { queryOptions } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

import type { Id } from "@acme/convex/model";
import { api } from "@acme/convex/api";
import { getThemeFromCookie } from "@acme/features/theme";

export const shopQueries = {
  theme: () =>
    queryOptions({
      queryKey: ["theme"],
      queryFn: getThemeFromCookie,
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  getByPath: (path: string) =>
    queryOptions({ ...convexQuery(api.pages.manage.getByPath, { path }) }),
  getDraftPreview: (draftId: Id<"pageDrafts">) =>
    queryOptions({
      ...convexQuery(api.pages.drafts.getPreview, { draftId }),
    }),
  getScheduledPreview: (scheduledId: Id<"pageScheduled">) =>
    queryOptions({
      ...convexQuery(api.pages.scheduled.getPreview, { scheduledId }),
    }),
  getReleasePreview: (releaseId: Id<"pageReleases">) =>
    queryOptions({
      ...convexQuery(api.pages.releases.getPreview, { releaseId }),
    }),
};
