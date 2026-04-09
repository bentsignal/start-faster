import { createFileRoute } from "@tanstack/react-router";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@acme/convex/api";
import { listCollectionHandles } from "@acme/shopify/storefront/collection";
import { listProductHandles } from "@acme/shopify/storefront/product";

import { env } from "~/env";
import { shopify } from "~/lib/shopify";

const SHOPIFY_PAGE_SIZE = 250;

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  imageLoc?: string;
}

async function fetchProductPage(after: string | null) {
  const response = await shopify.request(listProductHandles, {
    variables: { first: SHOPIFY_PAGE_SIZE, after },
  });
  return response.data?.products;
}

async function* iterateProductHandles() {
  let after = null;
  while (true) {
    const products = await fetchProductPage(after);
    if (!products) return;
    for (const node of products.nodes) {
      yield node;
    }
    if (!products.pageInfo.hasNextPage) return;
    if (!products.pageInfo.endCursor) return;
    after = products.pageInfo.endCursor;
  }
}

async function fetchAllProductEntries() {
  const entries = [];
  for await (const node of iterateProductHandles()) {
    entries.push({
      loc: `${env.VITE_SITE_URL}/shop/${encodeURIComponent(node.handle)}`,
      lastmod: node.updatedAt,
      imageLoc: node.featuredImage?.url,
    });
  }
  return entries;
}

async function fetchCollectionPage(after: string | null) {
  const response = await shopify.request(listCollectionHandles, {
    variables: { first: SHOPIFY_PAGE_SIZE, after },
  });
  return response.data?.collections;
}

async function* iterateCollectionHandles() {
  let after = null;
  while (true) {
    const collections = await fetchCollectionPage(after);
    if (!collections) return;
    for (const node of collections.nodes) {
      yield node;
    }
    if (!collections.pageInfo.hasNextPage) return;
    if (!collections.pageInfo.endCursor) return;
    after = collections.pageInfo.endCursor;
  }
}

async function fetchAllCollectionEntries() {
  const entries = [];
  for await (const node of iterateCollectionHandles()) {
    entries.push({
      loc: `${env.VITE_SITE_URL}/collections/${encodeURIComponent(node.handle)}`,
      lastmod: node.updatedAt,
      imageLoc: node.image?.url,
    });
  }
  return entries;
}

async function fetchCmsPageEntries() {
  const convex = new ConvexHttpClient(env.VITE_CONVEX_URL);
  const pages = await convex.query(api.pages.manage.listForSitemap, {});

  return pages.map((page) => ({
    loc: `${env.VITE_SITE_URL}${page.path}`,
    lastmod: new Date(page.updatedAt).toISOString(),
  }));
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderEntry(entry: SitemapEntry) {
  const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
  if (entry.lastmod) {
    parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
  }
  if (entry.imageLoc) {
    parts.push(
      `    <image:image><image:loc>${escapeXml(entry.imageLoc)}</image:loc></image:image>`,
    );
  }
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

function renderSitemap(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.map(renderEntry).join("\n")}
</urlset>`;
}

function pickLatestLastmod(entries: SitemapEntry[]) {
  let latest = undefined;
  for (const entry of entries) {
    if (!entry.lastmod) continue;
    if (latest === undefined || entry.lastmod > latest) {
      latest = entry.lastmod;
    }
  }
  return latest;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [products, collections, cmsPages] = await Promise.all([
          fetchAllProductEntries(),
          fetchAllCollectionEntries(),
          fetchCmsPageEntries(),
        ]);

        const childEntries = [...collections, ...products, ...cmsPages];

        const homepage = {
          loc: `${env.VITE_SITE_URL}/`,
          lastmod: pickLatestLastmod(childEntries),
        };

        const entries = [homepage, ...childEntries];

        return new Response(renderSitemap(entries), {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
