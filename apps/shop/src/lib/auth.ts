import { createHash, randomBytes } from "node:crypto";
import { deleteCookie, getCookie } from "@tanstack/react-start/server";

import { env } from "~/env";

const customerSessionCookieName = "shopify_customer_session";
const customerOAuthCookieName = "shopify_customer_oauth";

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
  path: "/",
};

function isSecureRequest(request: Request): boolean {
  const url = new URL(request.url);
  if (url.protocol === "https:") {
    return true;
  }
  return request.headers.get("x-forwarded-proto") === "https";
}

function serializeCookie(params: {
  name: string;
  value: string;
  maxAge: number;
  secure: boolean;
}): string {
  const parts = [
    `${params.name}=${params.value}`,
    `Max-Age=${params.maxAge}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (params.secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function parseCookieHeader(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const index = part.indexOf("=");
      if (index <= 0) {
        return acc;
      }
      const key = part.slice(0, index).trim();
      const value = part.slice(index + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

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

export function createCustomerLogin(params: {
  request: Request;
  returnTo: string;
}): { authorizeUrl: string; oauthCookie: string } {
  const state = createState();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const nextReturnTo = normalizeCustomerReturnTo(params.returnTo);
  const oauthState: CustomerOAuthState = {
    state,
    codeVerifier,
    returnTo: nextReturnTo,
  };
  const secure = isSecureRequest(params.request);
  const oauthCookie = serializeCookie({
    name: customerOAuthCookieName,
    value: encodeJson(oauthState),
    maxAge: 60 * 10,
    secure,
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

  return {
    authorizeUrl: authorizeUrl.toString(),
    oauthCookie,
  };
}

export async function handleCustomerAuthCallback(params: {
  request: Request;
  code: string;
  state: string;
}): Promise<{
  returnTo: string;
  clearOAuthCookie: string;
  sessionCookie: string;
}> {
  const cookies = parseCookieHeader(params.request.headers.get("cookie"));
  const stateCookieValue = cookies[customerOAuthCookieName] ?? null;
  const stateCookie = stateCookieValue
    ? decodeJson<CustomerOAuthState>(stateCookieValue)
    : null;

  if (stateCookie?.state !== params.state) {
    throw new Error("Invalid Shopify customer auth state.");
  }
  const secure = isSecureRequest(params.request);
  const clearOAuthCookie = serializeCookie({
    name: customerOAuthCookieName,
    value: "",
    maxAge: 0,
    secure,
  });

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
  const sessionCookie = serializeCookie({
    name: customerSessionCookieName,
    value: encodeJson(session),
    maxAge: 60 * 60 * 24 * 30,
    secure,
  });

  return {
    returnTo: stateCookie.returnTo,
    clearOAuthCookie,
    sessionCookie,
  };
}

export function clearCustomerSession() {
  const options = {
    ...cookieBaseOptions,
    secure: env.VITE_NODE_ENV === "production",
  };
  deleteCookie(customerSessionCookieName, options);
  deleteCookie(customerOAuthCookieName, options);
}

export function createCustomerLogoutCookies(request: Request): string[] {
  const secure = isSecureRequest(request);
  return [
    serializeCookie({
      name: customerSessionCookieName,
      value: "",
      maxAge: 0,
      secure,
    }),
    serializeCookie({
      name: customerOAuthCookieName,
      value: "",
      maxAge: 0,
      secure,
    }),
  ];
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
      accessToken: null,
      customer: null,
    };
  }
  if (Date.now() >= session.expiresAt) {
    clearCustomerSession();
    return {
      isSignedIn: false,
      accessToken: null,
      customer: null,
    };
  }
  if (!session.customer) {
    clearCustomerSession();
    return {
      isSignedIn: false,
      accessToken: null,
      customer: null,
    };
  }
  return {
    isSignedIn: true,
    accessToken: session.accessToken,
    customer: session.customer,
  };
}
