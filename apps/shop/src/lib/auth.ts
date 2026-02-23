import { createHash } from "node:crypto";
import type { HydrogenSession } from "@shopify/hydrogen";
import {
  clearSession,
  getRequest,
  getResponseHeader,
  getSession,
  updateSession,
} from "@tanstack/react-start/server";
import { createCustomerAccountClient } from "@shopify/hydrogen";

import type { GetCustomerIdentityQuery } from "@acme/shopify/customer/generated";
import { getCustomerIdentity } from "@acme/shopify/customer/account";

import { env } from "~/env";

export interface ShopifyCustomerIdentity {
  sub: string | null;
  email: string | null;
  name: string | null;
}

export type ShopifyCustomerAuthState =
  | {
      isSignedIn: false;
      accessToken: null;
      customer: null;
    }
  | {
      isSignedIn: true;
      accessToken: string;
      customer: ShopifyCustomerIdentity;
    };

type SessionValue = Record<string, unknown>;

interface SessionAdapter {
  isPending: boolean;
  get: (key: string) => unknown;
  set: (key: string, value: unknown) => void;
  unset: (key: string) => void;
  commit: () => Promise<string>;
  destroy: () => Promise<string>;
}

function isSecureRequest(request: Request): boolean {
  const url = new URL(request.url);
  if (url.protocol === "https:") {
    return true;
  }
  return request.headers.get("x-forwarded-proto") === "https";
}

function shouldUseSecureCookies(request: Request): boolean {
  if (env.VITE_NODE_ENV === "production") {
    return true;
  }
  return isSecureRequest(request);
}

function normalizeSessionPassword(value: string): string {
  if (value.length >= 32) {
    return value;
  }
  return createHash("sha256").update(value).digest("hex");
}

function getSessionPassword(): string {
  const fallback = `${env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID}:${env.SHOPIFY_STORE_DOMAIN}`;
  return normalizeSessionPassword(
    env.SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET ?? fallback,
  );
}

function resolveShopId(): string {
  if (env.SHOPIFY_SHOP_ID) {
    return env.SHOPIFY_SHOP_ID;
  }
  const endpoint = new URL(env.SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZATION_ENDPOINT);
  const segments = endpoint.pathname.split("/").filter(Boolean);
  const authIndex = segments.indexOf("authentication");
  if (authIndex >= 0) {
    const next = segments[authIndex + 1];
    if (next) {
      return next;
    }
  }
  throw new Error("Unable to resolve Shopify shop id.");
}

async function createHydrogenSessionAdapter(
  request: Request,
): Promise<SessionAdapter> {
  const config = {
    name: "shopify_customer_session",
    password: getSessionPassword(),
    maxAge: 60 * 60 * 24 * 30,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: shouldUseSecureCookies(request),
    },
  } as const;

  const session = await getSession<SessionValue>(config);
  const data: SessionValue = { ...session.data };
  let pending = false;

  return {
    get isPending() {
      return pending;
    },
    set isPending(next: boolean) {
      pending = next;
    },
    get(key) {
      return data[key];
    },
    set(key, value) {
      data[key] = value;
      pending = true;
    },
    unset(key) {
      delete data[key];
      pending = true;
    },
    async commit() {
      await updateSession(config, () => data);
      pending = false;
      return getResponseHeader("set-cookie") ?? "";
    },
    async destroy() {
      await clearSession(config);
      pending = false;
      return getResponseHeader("set-cookie") ?? "";
    },
  };
}

function withReturnTo(request: Request, returnTo: string): Request {
  const url = new URL(request.url);
  url.searchParams.set("return_to", normalizeCustomerReturnTo(returnTo));
  return new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
  });
}

interface AuthClientContext {
  session: SessionAdapter;
  customerAccount: ReturnType<typeof createCustomerAccountClient>;
}

export async function createHydrogenCustomerAuthContext(params: {
  request: Request;
  returnTo?: string;
}): Promise<AuthClientContext> {
  const requestForAuth =
    typeof params.returnTo === "string"
      ? withReturnTo(params.request, params.returnTo)
      : params.request;

  const session = await createHydrogenSessionAdapter(params.request);
  const customerAccount = createCustomerAccountClient({
    request: requestForAuth,
    session: session as unknown as HydrogenSession,
    customerAccountId: env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
    shopId: resolveShopId(),
    loginPath: "/login",
    authorizePath: "/callback",
    defaultRedirectPath: "/",
  });

  return {
    session,
    customerAccount,
  };
}

export async function appendPendingSessionCookie(
  response: Response,
  session: SessionAdapter,
): Promise<Response> {
  if (!session.isPending) {
    return response;
  }
  const cookie = await session.commit();
  if (!cookie) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.append("set-cookie", cookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function normalizeCustomerReturnTo(returnTo: string): string {
  const value = returnTo.trim();
  if (!value) {
    return "/";
  }
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "/";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
  } catch {
    return "/";
  }
}

export function isTrustedCustomerAuthRequest(request: Request): boolean {
  const expectedOrigin = new URL(env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI)
    .origin;
  const origin = request.headers.get("origin");
  if (origin) {
    return origin === expectedOrigin;
  }
  const referer = request.headers.get("referer");
  if (!referer) {
    return false;
  }
  try {
    return new URL(referer).origin === expectedOrigin;
  } catch {
    return false;
  }
}

function toIdentity(
  customer: GetCustomerIdentityQuery["customer"],
): ShopifyCustomerIdentity {
  const name = [customer.firstName, customer.lastName]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .trim();
  return {
    sub: customer.id,
    email: customer.emailAddress?.emailAddress ?? null,
    name: name || null,
  };
}

export async function getShopifyCustomerAuthState(): Promise<ShopifyCustomerAuthState> {
  const request = getRequest();
  const { customerAccount } = await createHydrogenCustomerAuthContext({
    request,
  });
  const isSignedIn = await customerAccount.isLoggedIn();
  if (!isSignedIn) {
    return {
      isSignedIn: false,
      accessToken: null,
      customer: null,
    };
  }

  const accessToken = await customerAccount.getAccessToken();
  if (!accessToken) {
    return {
      isSignedIn: false,
      accessToken: null,
      customer: null,
    };
  }

  const result = (await customerAccount.query(getCustomerIdentity)) as {
    data?: GetCustomerIdentityQuery | null;
  };
  const customer = result.data?.customer;
  if (!customer) {
    return {
      isSignedIn: false,
      accessToken: null,
      customer: null,
    };
  }

  return {
    isSignedIn: true,
    accessToken,
    customer: toIdentity(customer),
  };
}
