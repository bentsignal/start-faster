import { convert } from "great-time";

export function createImageConfig({
  uploadthingUrl,
  shopifyImageUrlStoreId,
  convexSiteUrl,
  sizes,
}: {
  uploadthingUrl: string;
  shopifyImageUrlStoreId: string;
  convexSiteUrl?: string;
  sizes: number[];
}) {
  const formats = ["image/webp", "image/avif"] satisfies (
    | "image/webp"
    | "image/avif"
  )[];
  return {
    sizes,
    qualities: [75] as const,
    domains: [],
    minimumCacheTTL: convert(24, "hours", "to seconds"),
    formats,
    localPatterns: [{ pathname: "^/.*$", search: "" }],
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: new URL(uploadthingUrl).hostname,
        pathname: "/f/**",
        search: "",
      },
      {
        protocol: "https" as const,
        hostname: "cdn.shopify.com",
        pathname: `/s/files/1/${shopifyImageUrlStoreId}/**`,
        search: "",
      },
      // Omit `search` for Convex file downloads so the opaque download token
      // and optional filename query params are accepted. The token itself is
      // the credential.
      ...(convexSiteUrl
        ? [
            {
              protocol: "https" as const,
              hostname: new URL(convexSiteUrl).hostname,
              pathname: "/files/download",
            },
          ]
        : []),
    ],
  };
}
