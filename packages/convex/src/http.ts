import { httpRouter } from "convex/server";

import { registerRoutes } from "@acme/files";

import { api, components } from "./_generated/api";
import { CMS_FILES_ACCESS_KEY } from "./files";
import { hasCmsScopeOrAdmin } from "./privileges";

const http = httpRouter();

registerRoutes(http, components.convexFilesControl, {
  pathPrefix: "files",
  enableUploadRoute: true,
  enableDownloadRoute: false,
  defaultUploadProvider: "convex",
  checkUploadRequest: async (ctx, args) => {
    if (args.provider !== "convex") {
      return new Response(
        JSON.stringify({ error: "Only Convex storage is supported." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const currentUser = await ctx
      .runQuery(api.users.getCurrentUser, {})
      .catch(() => null);
    if (!currentUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!hasCmsScopeOrAdmin(currentUser, "can-upload-files")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      accessKeys: [CMS_FILES_ACCESS_KEY],
    };
  },
  onUploadComplete: async (ctx, args) => {
    if (!(args.file instanceof File)) {
      throw new Error("Expected a File object in onUploadComplete callback");
    }

    await ctx.runMutation(api.files.recordUpload, {
      storageId: args.result.storageId,
      storageProvider: args.result.storageProvider,
      fileName: args.file.name,
      metadata: args.result.metadata,
    });
  },
});

export default http;
