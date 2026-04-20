import { queryOptions } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

import type { Id } from "@acme/convex/model";
import { api } from "@acme/convex/api";

export const DRAFTS_PAGE_SIZE = 20;
export const RELEASES_PAGE_SIZE = 20;
export const SCHEDULED_PAGE_SIZE = 20;

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
  listReleasesFirstPage: (pageId: Id<"pages">) =>
    queryOptions({
      ...convexQuery(api.pages.releases.list, {
        pageId,
        paginationOpts: { numItems: RELEASES_PAGE_SIZE, cursor: null },
      }),
    }),
  listRecentReleases: (pageId: Id<"pages">) =>
    queryOptions({
      ...convexQuery(api.pages.releases.listRecent, { pageId }),
    }),
  listScheduledFirstPage: (pageId: Id<"pages">) =>
    queryOptions({
      ...convexQuery(api.pages.scheduled.listForPage, {
        pageId,
        paginationOpts: { numItems: SCHEDULED_PAGE_SIZE, cursor: null },
      }),
    }),
  getScheduled: (scheduledId: Id<"pageScheduled">) =>
    queryOptions({
      ...convexQuery(api.pages.scheduled.get, { scheduledId }),
    }),
  getRelease: (releaseId: Id<"pageReleases">) =>
    queryOptions({
      ...convexQuery(api.pages.releases.get, { releaseId }),
    }),
  listUpcomingScheduled: (limit: number) =>
    queryOptions({
      ...convexQuery(api.pages.scheduled.listUpcoming, { limit }),
    }),
  listRecentlyPublished: (limit: number) =>
    queryOptions({
      ...convexQuery(api.pages.releases.listRecentlyPublished, { limit }),
    }),
};
