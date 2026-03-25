import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export const shopQueries = {
  getByPath: (path: string) => convexQuery(api.pages.getByPath, { path }),
};
