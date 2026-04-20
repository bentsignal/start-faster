import { queryOptions } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";

import { api } from "@acme/convex/api";

export const fileQueries = {
  list: () => queryOptions({ ...convexQuery(api.files.list, {}) }),
};
