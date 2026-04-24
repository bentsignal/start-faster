import type { Infer } from "convex/values";
import { ConvexError, v } from "convex/values";

import type { MutationCtx } from "./_generated/server";
import type { AuthNmutationCtx } from "./custom";
import type { StorageProvider } from "./validators";
import { components } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { authNmutation, authNquery } from "./custom";
import { ensureCmsScopeOrAdmin } from "./privileges";
import { storageProviderValidator } from "./validators";

export const CMS_FILES_ACCESS_KEY = "files";

const fileMetadataValidator = v.object({
  storageId: v.optional(v.string()),
  size: v.number(),
  sha256: v.string(),
  contentType: v.union(v.string(), v.null()),
});
type FileMetadata = Infer<typeof fileMetadataValidator>;

function ensureConvexStorage(provider: StorageProvider) {
  if (provider !== "convex") {
    throw new ConvexError("Only Convex file storage is supported.");
  }
}

async function createShareableDownloadToken(
  ctx: AuthNmutationCtx | MutationCtx,
  storageId: string,
) {
  const grant = await ctx.runMutation(
    components.convexFilesControl.download.createDownloadGrant,
    {
      storageId,
      maxUses: null,
      expiresAt: null,
      shareableLink: true,
    },
  );
  return grant.downloadToken;
}

async function insertCmsFileRecord(
  ctx: AuthNmutationCtx,
  args: {
    storageId: string;
    storageProvider: StorageProvider;
    fileName: string;
    metadata: FileMetadata | null;
  },
) {
  if (!args.metadata) {
    throw new ConvexError("File metadata is required.");
  }

  const existingRecord = await ctx.db
    .query("files")
    .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
    .unique();
  if (existingRecord) {
    if (!existingRecord.downloadToken) {
      const downloadToken = await createShareableDownloadToken(
        ctx,
        args.storageId,
      );
      await ctx.db.patch(existingRecord._id, { downloadToken });
    }
    return existingRecord._id;
  }

  const downloadToken = await createShareableDownloadToken(ctx, args.storageId);

  return await ctx.db.insert("files", {
    storageId: args.storageId,
    storageProvider: args.storageProvider,
    fileName: args.fileName,
    contentType: args.metadata.contentType,
    size: args.metadata.size,
    sha256: args.metadata.sha256,
    uploadedByUserId: ctx.user._id,
    downloadToken,
  });
}

export const generateUploadUrl = authNmutation({
  args: {
    provider: storageProviderValidator,
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-upload-files");
    ensureConvexStorage(args.provider);

    return await ctx.runMutation(
      components.convexFilesControl.upload.generateUploadUrl,
      {
        provider: "convex",
      },
    );
  },
});

export const finalizeUpload = authNmutation({
  args: {
    uploadToken: v.string(),
    storageId: v.string(),
    fileName: v.string(),
    expiresAt: v.optional(v.union(v.null(), v.number())),
    metadata: v.optional(fileMetadataValidator),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-upload-files");

    const result = await ctx.runMutation(
      components.convexFilesControl.upload.finalizeUpload,
      {
        uploadToken: args.uploadToken,
        storageId: args.storageId,
        accessKeys: [CMS_FILES_ACCESS_KEY],
        expiresAt: args.expiresAt,
        metadata: args.metadata,
      },
    );

    await insertCmsFileRecord(ctx, {
      storageId: result.storageId,
      storageProvider: result.storageProvider,
      fileName: args.fileName,
      metadata: result.metadata ?? args.metadata ?? null,
    });

    return result;
  },
});

export const recordUpload = authNmutation({
  args: {
    storageId: v.string(),
    storageProvider: storageProviderValidator,
    fileName: v.string(),
    metadata: v.union(fileMetadataValidator, v.null()),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-upload-files");
    ensureConvexStorage(args.storageProvider);

    return await insertCmsFileRecord(ctx, args);
  },
});

export const rename = authNmutation({
  args: {
    fileId: v.id("files"),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-upload-files");

    const trimmed = args.fileName.trim();
    if (!trimmed) {
      throw new ConvexError("File name cannot be empty.");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("File not found.");
    }

    await ctx.db.patch(args.fileId, { fileName: trimmed });
  },
});

export const remove = authNmutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-upload-files");

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("File not found.");
    }

    await ctx.runMutation(components.convexFilesControl.cleanUp.deleteFile, {
      storageId: file.storageId,
    });

    await ctx.db.delete(args.fileId);
  },
});

// One-shot backfill for records that predate the downloadToken field. Exposed
// as an internal mutation so it can only be invoked from the Convex dashboard
// (or a scheduled/internal caller), never from the client API.
export const ensureDownloadTokens = internalMutation({
  args: {},
  handler: async (ctx) => {
    const files = await ctx.db.query("files").collect();
    const missing = files.filter((file) => !file.downloadToken);

    for (const file of missing) {
      const downloadToken = await createShareableDownloadToken(
        ctx,
        file.storageId,
      );
      await ctx.db.patch(file._id, { downloadToken });
    }

    return { backfilled: missing.length };
  },
});

export const list = authNquery({
  args: {},
  handler: async (ctx) => {
    ensureCmsScopeOrAdmin(ctx.user, "can-upload-files");

    const files = await ctx.db.query("files").order("desc").collect();

    return await Promise.all(
      files.map(async (file) => {
        const uploadedByUser = await ctx.db.get(file.uploadedByUserId);

        return {
          ...file,
          uploadedBy: uploadedByUser
            ? {
                _id: uploadedByUser._id,
                name: uploadedByUser.name,
                email: uploadedByUser.email,
              }
            : null,
        };
      }),
    );
  },
});
