import type { HydrogenSession } from "@shopify/hydrogen";
import {
  clearSession,
  getResponseHeader,
  getSession,
  updateSession,
} from "@tanstack/react-start/server";
import { createCustomerAccountClient } from "@shopify/hydrogen";

import type { GetCustomerIdentityQuery } from "@acme/shopify/customer/generated";

import { env } from "~/env";

function isSecureRequest(request: Request) {
  const url = new URL(request.url);
  if (url.protocol === "https:") {
    return true;
  }
  return request.headers.get("x-forwarded-proto") === "https";
}

function shouldUseSecureCookies(request: Request) {
  if (env.VITE_NODE_ENV === "production") {
    return true;
  }
  return isSecureRequest(request);
}

async function createHydrogenSessionAdapter(
  request: Request,
): Promise<HydrogenSession> {
  const config = {
    name: "__Host-shopify_customer_session",
    password: env.SHOPIFY_CUSTOMER_ACCOUNT_SESSION_SECRET,
    maxAge: 60 * 60 * 24 * 30,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: shouldUseSecureCookies(request),
    },
  } as const;

  const session = await getSession<Record<string, unknown>>(config);
  const data = { ...session.data };
  let pending = false;

  return {
    get isPending() {
      return pending;
    },
    set isPending(next) {
      pending = next;
    },
    get<Key extends string>(key: Key): ReturnType<HydrogenSession["get"]> {
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
  } satisfies HydrogenSession;
}

function withReturnTo(request: Request, returnTo: string) {
  const url = new URL(request.url);
  url.searchParams.set("return_to", normalizeCustomerReturnTo(returnTo));
  return new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
  });
}

export async function createHydrogenCustomerAuthContext(params: {
  request: Request;
  returnTo?: string;
}) {
  const requestForAuth = params.returnTo
    ? withReturnTo(params.request, params.returnTo)
    : params.request;

  const session = await createHydrogenSessionAdapter(params.request);
  const customerAccount = createCustomerAccountClient({
    request: requestForAuth,
    session: session,
    customerAccountId: env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
    shopId: env.SHOPIFY_SHOP_ID,
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
  session: HydrogenSession,
) {
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

export function normalizeCustomerReturnTo(returnTo: string) {
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
    const normalizedPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (
      !normalizedPath ||
      !normalizedPath.startsWith("/") ||
      normalizedPath.startsWith("//")
    ) {
      return "/";
    }
    return normalizedPath;
  } catch {
    return "/";
  }
}

export function isTrustedCustomerAuthRequest(request: Request) {
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

export function toIdentity(customer: GetCustomerIdentityQuery["customer"]) {
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
