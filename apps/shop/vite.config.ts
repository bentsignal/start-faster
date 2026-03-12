import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(async ({ mode }) => {
  const { env } = await import("./src/env");
  const isDevelopment =
    mode === "development" || env.VITE_NODE_ENV === "development";

  const { imageWidths } = await import("./src/features/image/sizes");
  const imageFormats: Array<"image/webp" | "image/avif"> = ["image/webp"];
  const imageConfig = {
    domains: [env.VITE_UT_URL],
    sizes: [...imageWidths],
    minimumCacheTTL: 60,
    formats: imageFormats,
    localPatterns: [{ pathname: "^/.*$", search: "" }],
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
