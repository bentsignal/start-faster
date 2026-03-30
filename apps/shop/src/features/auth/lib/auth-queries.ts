import { queryOptions } from "@tanstack/react-query";
import { convert } from "great-time";

import { getAuthState } from "~/features/auth/server/get-auth-state";

export const authQueries = {
  state: () =>
    queryOptions({
      queryKey: ["auth"],
      queryFn: getAuthState,
      staleTime: convert(50, "minutes", "to ms"),
      gcTime: Infinity,
    }),
};
