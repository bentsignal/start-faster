import type { AuthFunctions, GenericCtx } from "@convex-dev/better-auth";
import { createClient } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";

import type { DataModel } from "./_generated/dataModel";
import { components, internal } from "./_generated/api";
import authConfig from "./auth.config";
import { env } from "./convex.env";

const authFunctions: AuthFunctions = internal.auth;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  authFunctions,
  triggers: {
    user: {
      onCreate: async (ctx, doc) => {
        await ctx.db.insert("profiles", {
          userId: doc._id,
          name: doc.name,
        });
      },
    },
  },
});

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: env.SITE_URL,
    trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
    database: authComponent.adapter(ctx),
    socialProviders: {
      google: {
        prompt: "select_account",
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },
    plugins: [convex({ authConfig }), crossDomain({ siteUrl: env.SITE_URL })],
  });
};

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi();
