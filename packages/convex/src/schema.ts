import { defineSchema, defineTable } from "convex/server";

import { vProfile } from "./validators";

export default defineSchema(
  {
    profiles: defineTable(vProfile).index("by_userId", ["userId"]),
  },
  { schemaValidation: true },
);
