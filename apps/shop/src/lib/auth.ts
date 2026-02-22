import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JWTPayload } from "jose";
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
  expiresAt: number;
}

interface CustomerAuthSession {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  expiresAt: number;
  customer: ShopifyCustomerIdentity | null;
}

interface JwtPayload extends JWTPayload {
  email?: string;
  name?: string;
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

function shouldUseSecureCookies(request: Request): boolean {
  if (env.VITE_NODE_ENV === "production") {
    return true;
  }
  return isSecureRequest(request);
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

function toCustomerIdentity(payload: JwtPayload): ShopifyCustomerIdentity {
  return {
    sub: payload.sub ?? null,
    email: payload.email ?? null,
    name: payload.name ?? null,
  };
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

function createOpaqueId(): string {
  return toBase64Url(randomBytes(32));
}

const oauthStateMaxAgeSeconds = 60 * 10;
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;
const oauthStateStoreMaxEntries = 2000;
const sessionStoreMaxEntries = 10000;
const openIdConfigurationCacheMaxAgeMs = 5 * 60 * 1000;

interface OpenIdConfiguration {
  issuer: string;
  jwks_uri: string;
}

let openIdConfigurationCache:
  | { value: OpenIdConfiguration; fetchedAt: number }
  | null = null;
let customerJwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;
let customerJwksUriCache: string | null = null;

interface CustomerAuthStores {
  oauth: Map<string, CustomerOAuthState>;
  sessions: Map<string, CustomerAuthSession>;
}

declare global {
  var __shopifyCustomerAuthStores: CustomerAuthStores | undefined;
}

function getCustomerAuthStores(): CustomerAuthStores {
  globalThis.__shopifyCustomerAuthStores ??= {
    oauth: new Map<string, CustomerOAuthState>(),
    sessions: new Map<string, CustomerAuthSession>(),
  };
  return globalThis.__shopifyCustomerAuthStores;
}

function cleanupExpiredOAuthStates(now: number) {
  const stores = getCustomerAuthStores();
  for (const [key, value] of stores.oauth.entries()) {
    if (value.expiresAt <= now) {
      stores.oauth.delete(key);
    }
  }
}

function cleanupExpiredSessions(now: number) {
  const stores = getCustomerAuthStores();
  for (const [key, value] of stores.sessions.entries()) {
    if (value.expiresAt <= now) {
      stores.sessions.delete(key);
    }
  }
}

function enforceStoreLimit<T>(store: Map<string, T>, maxEntries: number) {
  while (store.size > maxEntries) {
    const oldestKey = store.keys().next().value;
    if (typeof oldestKey !== "string") {
      break;
    }
    store.delete(oldestKey);
  }
}

function parseCookieValue(request: Request, name: string): string | null {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  const value = cookies[name];
  return value ?? null;
}

function clearCustomerSessionIdCookie(): void {
  const options = {
    ...cookieBaseOptions,
    secure: env.VITE_NODE_ENV === "production",
  };
  deleteCookie(customerSessionCookieName, options);
}

function clearCustomerOAuthCookie(): void {
  const options = {
    ...cookieBaseOptions,
    secure: env.VITE_NODE_ENV === "production",
  };
  deleteCookie(customerOAuthCookieName, options);
}

async function getCustomerOpenIdConfiguration(): Promise<OpenIdConfiguration> {
  const now = Date.now();
  if (
    openIdConfigurationCache &&
    now - openIdConfigurationCache.fetchedAt < openIdConfigurationCacheMaxAgeMs
  ) {
    return openIdConfigurationCache.value;
  }
  const storeDomain = env.SHOPIFY_STORE_DOMAIN.trim();
  const storeBaseUrl =
    storeDomain.startsWith("http://") || storeDomain.startsWith("https://")
      ? storeDomain
      : `https://${storeDomain}`;
  const discoveryUrl = new URL("/.well-known/openid-configuration", storeBaseUrl);
  const response = await fetch(discoveryUrl.toString());
  if (!response.ok) {
    throw new Error("Unable to fetch Shopify OpenID configuration.");
  }
  const body = (await response.json()) as Record<string, unknown>;
  if (typeof body.issuer !== "string" || typeof body.jwks_uri !== "string") {
    throw new Error("Invalid Shopify OpenID configuration.");
  }
  const value: OpenIdConfiguration = {
    issuer: body.issuer,
    jwks_uri: body.jwks_uri,
  };
  openIdConfigurationCache = {
    value,
    fetchedAt: now,
  };
  return value;
}

function getCustomerJwks(jwksUri: string): ReturnType<typeof createRemoteJWKSet> {
  if (!customerJwksCache || customerJwksUriCache !== jwksUri) {
    customerJwksCache = createRemoteJWKSet(new URL(jwksUri));
    customerJwksUriCache = jwksUri;
  }
  return customerJwksCache;
}

async function verifyCustomerIdToken(idToken: string): Promise<JwtPayload> {
  const openIdConfiguration = await getCustomerOpenIdConfiguration();
  const jwks = getCustomerJwks(openIdConfiguration.jwks_uri);
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: openIdConfiguration.issuer,
    audience: env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID,
  });
  return payload as JwtPayload;
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

export function createCustomerLogin(params: {
  request: Request;
  returnTo: string;
}): { authorizeUrl: string; oauthCookie: string } {
  const now = Date.now();
  cleanupExpiredOAuthStates(now);
  const state = createState();
  const codeVerifier = createCodeVerifier();
  const codeChallenge = createCodeChallenge(codeVerifier);
  const nextReturnTo = normalizeCustomerReturnTo(params.returnTo);
  const oauthNonce = createOpaqueId();
  const oauthState: CustomerOAuthState = {
    state,
    codeVerifier,
    returnTo: nextReturnTo,
    expiresAt: now + oauthStateMaxAgeSeconds * 1000,
  };
  const stores = getCustomerAuthStores();
  stores.oauth.set(oauthNonce, oauthState);
  enforceStoreLimit(stores.oauth, oauthStateStoreMaxEntries);
  const secure = shouldUseSecureCookies(params.request);
  const oauthCookie = serializeCookie({
    name: customerOAuthCookieName,
    value: oauthNonce,
    maxAge: oauthStateMaxAgeSeconds,
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
  const now = Date.now();
  cleanupExpiredOAuthStates(now);
  const oauthNonce = parseCookieValue(params.request, customerOAuthCookieName);
  const stores = getCustomerAuthStores();
  const stateCookie = oauthNonce ? stores.oauth.get(oauthNonce) : null;
  if (oauthNonce) {
    stores.oauth.delete(oauthNonce);
  }
  if (stateCookie?.state !== params.state) {
    throw new Error("Invalid auth state.");
  }
  if (stateCookie.expiresAt <= now) {
    throw new Error("Expired auth state.");
  }
  const secure = shouldUseSecureCookies(params.request);
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

  const expiresAt = now + (payload.expires_in ?? 3600) * 1000;
  if (!payload.id_token) {
    throw new Error("Shopify customer auth token response is invalid.");
  }
  const idTokenPayload = await verifyCustomerIdToken(payload.id_token);
  if (!idTokenPayload.sub) {
    throw new Error("Invalid id token.");
  }
  const customer = toCustomerIdentity(idTokenPayload);
  const sessionId = createOpaqueId();
  const session: CustomerAuthSession = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    idToken: payload.id_token ?? null,
    expiresAt,
    customer,
  };
  cleanupExpiredSessions(now);
  stores.sessions.set(sessionId, session);
  enforceStoreLimit(stores.sessions, sessionStoreMaxEntries);
  const sessionCookie = serializeCookie({
    name: customerSessionCookieName,
    value: sessionId,
    maxAge: sessionMaxAgeSeconds,
    secure,
  });

  return {
    returnTo: stateCookie.returnTo,
    clearOAuthCookie,
    sessionCookie,
  };
}

export function clearCustomerSession() {
  const sessionId = getCookie(customerSessionCookieName);
  if (sessionId) {
    getCustomerAuthStores().sessions.delete(sessionId);
  }
  clearCustomerSessionIdCookie();
  clearCustomerOAuthCookie();
}

export function createCustomerLogout(params: {
  request: Request;
  returnTo: string;
}): { logoutUrl: string; cookies: string[] } {
  const requestUrl = new URL(params.request.url);
  const normalizedReturnTo = normalizeCustomerReturnTo(params.returnTo);
  const postLogoutRedirectUri = new URL(
    normalizedReturnTo,
    requestUrl.origin,
  ).toString();
  const sessionId = parseCookieValue(params.request, customerSessionCookieName);
  const stores = getCustomerAuthStores();
  const session = sessionId ? stores.sessions.get(sessionId) ?? null : null;
  if (sessionId) {
    stores.sessions.delete(sessionId);
  }
  const secure = shouldUseSecureCookies(params.request);
  const cookies = [
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
  if (!session?.idToken) {
    return {
      logoutUrl: postLogoutRedirectUri,
      cookies,
    };
  }
  const logoutUrl = new URL(
    String(env.SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_ENDPOINT),
  );
  logoutUrl.searchParams.set("id_token_hint", session.idToken);
  logoutUrl.searchParams.set(
    "post_logout_redirect_uri",
    postLogoutRedirectUri,
  );
  return {
    logoutUrl: logoutUrl.toString(),
    cookies,
  };
}

function readSession(): CustomerAuthSession | null {
  cleanupExpiredSessions(Date.now());
  const sessionId = getCookie(customerSessionCookieName);
  if (!sessionId) {
    return null;
  }
  const session = getCustomerAuthStores().sessions.get(sessionId) ?? null;
  if (!session) {
    clearCustomerSessionIdCookie();
    return null;
  }
  return session;
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
