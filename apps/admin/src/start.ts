import { createStart } from "@tanstack/react-start";
import { authkitMiddleware } from "@workos/authkit-tanstack-react-start";

import { workosRedirectUri } from "~/urls";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [authkitMiddleware({ redirectUri: workosRedirectUri })],
  };
});
