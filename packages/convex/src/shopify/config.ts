const requireEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required Shopify env: ${name}`);
  }
  return value;
};

export const getShopifyAdminConfig = () => ({
  domain: requireEnv("SHOPIFY_ADMIN_DOMAIN", process.env.SHOPIFY_ADMIN_DOMAIN),
  accessToken: requireEnv(
    "SHOPIFY_ADMIN_ACCESS_TOKEN",
    process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  ),
  apiVersion: requireEnv(
    "SHOPIFY_ADMIN_API_VERSION",
    process.env.SHOPIFY_ADMIN_API_VERSION,
  ),
});

export const getShopifyStorefrontConfig = () => ({
  domain: requireEnv(
    "SHOPIFY_STOREFRONT_DOMAIN",
    process.env.SHOPIFY_STOREFRONT_DOMAIN,
  ),
  accessToken: requireEnv(
    "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  ),
  apiVersion: requireEnv(
    "SHOPIFY_STOREFRONT_API_VERSION",
    process.env.SHOPIFY_STOREFRONT_API_VERSION,
  ),
});

export const getShopifyWebhookSecret = () =>
  requireEnv("SHOPIFY_WEBHOOK_SECRET", process.env.SHOPIFY_WEBHOOK_SECRET);
