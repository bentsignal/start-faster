import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export const adminQueries = {
  currentUser: () => convexQuery(api.users.getCurrentUser, {}),
};
