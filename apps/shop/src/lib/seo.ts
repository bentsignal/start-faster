import { getRequestUrl } from "@tanstack/react-start/server";

const SITE_NAME = "Start Faster";
const DEFAULT_DESCRIPTION = "The fastest shopping experience you've ever seen.";
const MAX_DESCRIPTION_LENGTH = 160;
interface SeoLinkTag {
  rel: string;
  href: string;
}
type SeoMetaTag =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };
interface SeoScriptTag {
  type: string;
  children?: string;
}

function ensureLeadingSlash(path: string) {
  if (path.length === 0) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function getRuntimeOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  try {
    return getRequestUrl().origin;
  } catch {
    return undefined;
  }
}

export function absoluteUrlFromPath(path: string) {
  const origin = getRuntimeOrigin();
  const normalizedPath = ensureLeadingSlash(path);

  if (origin === undefined) {
    return normalizedPath;
  }

  return new URL(normalizedPath, origin).toString();
}

export function toSeoDescription(
  description: string | null | undefined,
  fallback: string,
) {
  const normalized = description?.replace(/\s+/g, " ").trim();
  const value =
    normalized === undefined || normalized.length === 0 ? fallback : normalized;

  if (value.length <= MAX_DESCRIPTION_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

interface SeoHeadInput {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  imageAlt?: string;
  type?: "website" | "product";
  scripts?: SeoScriptTag[];
}

interface SeoHead {
  links: SeoLinkTag[];
  meta: SeoMetaTag[];
  scripts: SeoScriptTag[];
}

export function buildSeoHead({
  title,
  description,
  canonicalUrl,
  imageUrl,
  imageAlt,
  type = "website",
  scripts = [],
}: SeoHeadInput): SeoHead {
  const fullTitle =
    title === SITE_NAME || title.endsWith(`| ${SITE_NAME}`)
      ? title
      : `${title} | ${SITE_NAME}`;

  return {
    links: [{ rel: "canonical", href: canonicalUrl }],
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:type", content: type },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: imageUrl },
      ...(imageAlt === undefined
        ? []
        : [{ property: "og:image:alt", content: imageAlt }]),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:url", content: canonicalUrl },
      { name: "twitter:image", content: imageUrl },
      ...(imageAlt === undefined
        ? []
        : [{ name: "twitter:image:alt", content: imageAlt }]),
    ],
    scripts,
  };
}

export const defaultSeoDescription = DEFAULT_DESCRIPTION;

export function jsonLdScript(
  data: Record<string, unknown> | null | undefined,
): SeoScriptTag[] {
  if (data === undefined || data === null) {
    return [];
  }

  return [{ type: "application/ld+json", children: JSON.stringify(data) }];
}
