const APP_HOSTS = {
  shop: "start-faster",
  admin: "admin.start-faster",
  cms: "cms.start-faster",
  docs: "docs.start-faster",
} as const;

type AppId = keyof typeof APP_HOSTS;

interface AppUrlOptions {
  nodeEnv?: "development" | "production";
  worktreeId?: string;
}

function normalizeWorktreeId(worktreeId: string | undefined) {
  return worktreeId
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDomainSuffix(options: AppUrlOptions) {
  return options.nodeEnv === "production" ? "com" : "localhost";
}

function appUrl(app: AppId, options: AppUrlOptions = {}) {
  const prefix = normalizeWorktreeId(options.worktreeId);
  const host = [prefix, APP_HOSTS[app], getDomainSuffix(options)]
    .filter(Boolean)
    .join(".");

  return new URL(`https://${host}`).origin;
}

export function workosRedirectUri(
  app: Extract<AppId, "admin" | "cms">,
  options: AppUrlOptions = {},
) {
  return `${appUrl(app, options)}/callback`;
}

export function createAppUrls(options: AppUrlOptions = {}) {
  return {
    admin: appUrl("admin", options),
    cms: appUrl("cms", options),
    docs: appUrl("docs", options),
    shop: appUrl("shop", options),
  } as const;
}
