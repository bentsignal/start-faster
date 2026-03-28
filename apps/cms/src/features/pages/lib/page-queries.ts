import { queryOptions } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

import type { Id } from "@acme/convex/model";
import { api } from "@acme/convex/api";

export const DRAFTS_PAGE_SIZE = 20;

export const pageQueries = {
  list: () => queryOptions({ ...convexQuery(api.pages.list, {}) }),
  getById: (pageId: Id<"pages">) =>
    queryOptions({ ...convexQuery(api.pages.getById, { pageId }) }),
  getDraft: (draftId: Id<"pageDrafts">) =>
    queryOptions({ ...convexQuery(api.pages.getDraft, { draftId }) }),
  listDraftsFirstPage: (pageId: Id<"pages">) =>
    queryOptions({
      ...convexQuery(api.pages.listDrafts, {
        pageId,
        paginationOpts: { numItems: DRAFTS_PAGE_SIZE, cursor: null },
      }),
    }),
  listRecentReleases: (pageId: Id<"pages">) =>
    queryOptions({
      ...convexQuery(api.pages.listRecentReleases, { pageId }),
    }),
};
