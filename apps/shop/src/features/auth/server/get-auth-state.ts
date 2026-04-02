import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { getCustomerIdentity } from "@acme/shopify/customer/account";

import { createHydrogenCustomerAuthContext, toIdentity } from "~/lib/auth";

type CustomerIdentity = ReturnType<typeof toIdentity>;

type AuthState =
  | { isSignedIn: false; customer: null }
  | { isSignedIn: true; customer: CustomerIdentity };

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
      } as const satisfies AuthState;
    }

    const accessToken = await customerAccount.getAccessToken();
    if (!accessToken) {
      return {
        isSignedIn: false,
        customer: null,
      } as const satisfies AuthState;
    }
    const { data } = await customerAccount.query(getCustomerIdentity);

    return {
      isSignedIn: true,
      customer: toIdentity(data.customer),
    } as const satisfies AuthState;
  },
);
