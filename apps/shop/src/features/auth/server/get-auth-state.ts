import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { getCustomerIdentity } from "@acme/shopify/customer/account";

import { createHydrogenCustomerAuthContext, toIdentity } from "~/lib/auth";

export const getAuthState = createServerFn({ method: "GET" }).handler(
  async () => {
    const request = getRequest();
    const { customerAccount } = await createHydrogenCustomerAuthContext({
      request,
    });
    const isSignedIn = await customerAccount.isLoggedIn();
    if (!isSignedIn) {
      return {
        isSignedIn: false,
        customer: null,
      } as const;
    }

    const accessToken = await customerAccount.getAccessToken();
    if (!accessToken) {
      return {
        isSignedIn: false,
        customer: null,
      } as const;
    }
    const { data } = await customerAccount.query(getCustomerIdentity);

    return {
      isSignedIn: true,
      customer: toIdentity(data.customer),
    } as const;
  },
);
