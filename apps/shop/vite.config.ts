import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { convert } from "great-time";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ mode }) => {
  const { env } = await import("./src/env");
  const isDevelopment =
    mode === "development" || env.VITE_NODE_ENV === "development";

  const { imageWidths } = await import("@acme/ui/image/sizes");
  const imageFormats: Array<"image/webp" | "image/avif"> = ["image/webp"];
  const imageQualities = [75] as const;
  const imageConfig = {
    sizes: [...imageWidths],
    qualities: [...imageQualities],
    domains: [],
    minimumCacheTTL: convert(24, "hours", "to seconds"),
    formats: imageFormats,
    localPatterns: [{ pathname: "^/.*$", search: "" }],
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: new URL(env.VITE_UT_URL).hostname,
        pathname: "/f/**",
        search: "",
      },
      {
        protocol: "https" as const,
        hostname: "cdn.shopify.com",
        pathname: `/s/files/1/${env.VITE_SHOPIFY_IMAGE_URL_STORE_ID}/**`,
        search: "",
      },
    ],
  };

  return {
    server: {
      port: 3000,
      host: true,
      allowedHosts:
        isDevelopment && env.VITE_DEV_ALLOWED_HOST
          ? [env.VITE_DEV_ALLOWED_HOST]
          : undefined,
    },
    plugins: [
      devtools({}),
      tailwindcss(),
      tsconfigPaths(),
      tanstackStart({
        srcDirectory: "src",
        router: { routesDirectory: "app" },
      }),
      viteReact({
        babel: {
          plugins: ["babel-plugin-react-compiler"],
        },
      }),
      nitro({
        vercel: {
          config: {
            version: 3,
            images: imageConfig,
          },
        },
      }),
    ],
  };
});
