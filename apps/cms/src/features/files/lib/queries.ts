import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export const filesQueries = {
  currentUser: () => convexQuery(api.users.getCurrentUser, {}),
  list: () => convexQuery(api.files.list, {}),
};
