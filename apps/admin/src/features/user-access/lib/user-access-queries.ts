import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

import { USERS_PAGE_SIZE } from "~/features/user-access/constants";

export const userAccessQueries = {
  searchFirstPage: (searchTerm?: string) =>
    convexQuery(api.users.searchUsersPaginated, {
      searchTerm,
      paginationOpts: {
        numItems: USERS_PAGE_SIZE,
        cursor: null,
      },
    }),
  userById: (userId: string) =>
    convexQuery(api.users.getUserById, {
      userId,
    }),
};
