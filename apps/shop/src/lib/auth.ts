import { createHash, randomBytes } from "node:crypto";
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "@tanstack/react-start/server";

import { env } from "~/env";

const customerSessionCookieName = "shopify_customer_session";
const customerOAuthCookieName = "shopify_customer_oauth";

export interface ShopifyCustomerIdentity {
  sub: string | null;
  email: string | null;
  name: string | null;
}

export interface ShopifyCustomerAuthState {
  isSignedIn: boolean;
  customer: ShopifyCustomerIdentity | null;
}

interface CustomerOAuthState {
  state: string;
  codeVerifier: string;
  returnTo: string;
}

interface CustomerAuthSession {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number;
  customer: ShopifyCustomerIdentity | null;
}

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
}

const cookieBaseOptions = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  secure: env.VITE_NODE_ENV === "production",
  path: "/",
};

function toBase64Url(input: Buffer | string): string {
  const value = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string): Buffer {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad === 0 ? normalized : normalized + "=".repeat(4 - pad);
  return Buffer.from(padded, "base64");
}

function encodeJson(value: unknown): string {
  return toBase64Url(JSON.stringify(value));
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(fromBase64Url(value).toString("utf8")) as T;
  } catch {
    return null;
  }
}

function decodeJwtPayload(
  idToken: string | null | undefined,
): ShopifyCustomerIdentity | null {
  if (!idToken) {
    return null;
  }
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const payloadSegment = parts[1];
  if (!payloadSegment) {
    return null;
  }
  try {
    const payload = JSON.parse(
      fromBase64Url(payloadSegment).toString("utf8"),
    ) as {
      sub?: string;
      email?: string;
      name?: string;
    };
    return {
      sub: payload.sub ?? null,
      email: payload.email ?? null,
      name: payload.name ?? null,
    };
  } catch {
    return null;
  }
}

function createCodeVerifier(): string {
  return toBase64Url(randomBytes(64));
}

function createCodeChallenge(codeVerifier: string): string {
  return toBase64Url(createHash("sha256").update(codeVerifier).digest());
}

function createState(): string {
  return toBase64Url(randomBytes(24));
}

function getScopes(): string {
  return env.SHOPIFY_CUSTOMER_ACCOUNT_SCOPES ?? "openid email";
}

export function createCustomerLoginUrl(returnTo: string): string {
  const state = createState();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const nextReturnTo = returnTo.startsWith("/") ? returnTo : "/";
  const oauthState: CustomerOAuthState = {
    state,
    codeVerifier,
    returnTo: nextReturnTo,
  };

  setCookie(customerOAuthCookieName, encodeJson(oauthState), {
    ...cookieBaseOptions,
    maxAge: 60 * 10,
  });

  const authorizeUrl = new URL(
    env.SHOPIFY_CUSTOMER_ACCOUNT_AUTHORIZATION_ENDPOINT,
  );
  authorizeUrl.searchParams.set(
    "client_id",
    env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
  );
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set(
    "redirect_uri",
    env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI,
  );
  authorizeUrl.searchParams.set("scope", getScopes());
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("code_challenge", codeChallenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");

  return authorizeUrl.toString();
}

export async function handleCustomerAuthCallback(params: {
  code: string;
  state: string;
}): Promise<string> {
  const stateCookieValue = getCookie(customerOAuthCookieName);
  const stateCookie = stateCookieValue
    ? decodeJson<CustomerOAuthState>(stateCookieValue)
    : null;

  if (stateCookie?.state !== params.state) {
    throw new Error("Invalid Shopify customer auth state.");
  }

  deleteCookie(customerOAuthCookieName, cookieBaseOptions);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
    redirect_uri: env.SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI,
    code: params.code,
    code_verifier: stateCookie.codeVerifier,
  });

  const response = await fetch(env.SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Unable to exchange Shopify customer auth code.");
  }

  const payload = (await response.json()) as OAuthTokenResponse;

  if (!payload.access_token) {
    throw new Error("Shopify customer auth token response is invalid.");
  }

  const expiresAt = Date.now() + (payload.expires_in ?? 3600) * 1000;
  const customer = decodeJwtPayload(payload.id_token);
  const session: CustomerAuthSession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    idToken: payload.id_token ?? null,
    expiresAt,
    customer,
  };

  setCookie(customerSessionCookieName, encodeJson(session), {
    ...cookieBaseOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  return stateCookie.returnTo;
}

export function clearCustomerSession() {
  deleteCookie(customerSessionCookieName, cookieBaseOptions);
  deleteCookie(customerOAuthCookieName, cookieBaseOptions);
}

function readSession(): CustomerAuthSession | null {
  const value = getCookie(customerSessionCookieName);
  if (!value) {
    return null;
  }
  return decodeJson<CustomerAuthSession>(value);
}

export function getShopifyCustomerAuthState(): ShopifyCustomerAuthState {
  const session = readSession();
  if (!session) {
    return {
      isSignedIn: false,
      customer: null,
    };
  }
  if (Date.now() >= session.expiresAt) {
    clearCustomerSession();
    return {
      isSignedIn: false,
      customer: null,
    };
  }
  return {
    isSignedIn: true,
    customer: session.customer,
  };
}
