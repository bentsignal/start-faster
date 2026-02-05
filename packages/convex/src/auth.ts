import type { AuthFunctions, GenericCtx } from "@convex-dev/better-auth";
import { expo } from "@better-auth/expo";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";

import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { components, internal } from "./_generated/api";
import authConfig from "./auth.config";
import { env } from "./convex.env";

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx, doc) => {
        const username = await generateUsername(ctx, doc.name);
        const profileId = await ctx.db.insert("profiles", {
          userId: doc._id,
          name: doc.name,
          username,
          searchTerm: username + " " + doc.name,
        });
        if (doc.image) {
          await ctx.scheduler.runAfter(0, internal.uploadthing.uploadPFP, {
            profileId,
            url: doc.image,
          });
        }
      },
    },
  },
});

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: env.SITE_URL,
    trustedOrigins: [env.SITE_URL],
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [expo(), convex({ authConfig })],
  });
};

const generateUsername = async (ctx: MutationCtx, name: string) => {
  const splitName = name
    .toLowerCase()
    .split(" ")
    .map((part) => part.slice(0, 5))
    .join("_");
  let goodUsername = false;
  let username = "";
  while (!goodUsername) {
    username = splitName + Math.floor(Math.random() * 10000);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (!profile) {
      goodUsername = true;
    }
  }
  return username;
};

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
