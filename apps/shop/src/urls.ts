import { createAppUrls } from "@acme/app-config/urls";

import { env } from "~/env";

export const appUrls = createAppUrls({
  nodeEnv: env.VITE_NODE_ENV,
  worktreeId: env.VITE_WORKTREE_ID,
});
