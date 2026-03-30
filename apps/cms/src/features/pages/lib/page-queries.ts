import { queryOptions } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

import type { Id } from "@acme/convex/model";
import { api } from "@acme/convex/api";

export const DRAFTS_PAGE_SIZE = 20;

export const pageQueries = {
  list: () => queryOptions({ ...convexQuery(api.pages.manage.list, {}) }),
  getById: (pageId: Id<"pages">) =>
    queryOptions({ ...convexQuery(api.pages.manage.getById, { pageId }) }),
  getDraft: (draftId: Id<"pageDrafts">) =>
    queryOptions({ ...convexQuery(api.pages.drafts.get, { draftId }) }),
  listDraftsFirstPage: (pageId: Id<"pages">) =>
    queryOptions({
      ...convexQuery(api.pages.drafts.list, {
        pageId,
        paginationOpts: { numItems: DRAFTS_PAGE_SIZE, cursor: null },
      }),
    }),
  listRecentReleases: (pageId: Id<"pages">) =>
    queryOptions({
      ...convexQuery(api.pages.manage.listRecentReleases, { pageId }),
    }),
};
