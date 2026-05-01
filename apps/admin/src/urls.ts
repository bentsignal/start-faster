import {
  createAppUrls,
  workosRedirectUri as createWorkosRedirectUri,
} from "@acme/app-config/urls";

import { env } from "~/env";

const options = {
  nodeEnv: env.VITE_NODE_ENV,
  worktreeId: env.VITE_WORKTREE_ID,
} as const;

export const appUrls = createAppUrls(options);

export const workosRedirectUri = createWorkosRedirectUri("admin", options);
