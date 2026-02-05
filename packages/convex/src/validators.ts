import { v } from "convex/values";

const vProfile = v.object({
  userId: v.string(),
  name: v.string(),
  username: v.string(),
  image: v.optional(v.string()),
  bio: v.optional(v.string()),
  link: v.optional(v.string()),
  searchTerm: v.string(),
});

const vFriendshipStatus = v.union(v.literal("pending"), v.literal("friends"));

const vFriendship = v.object({
  profileIdA: v.id("profiles"),
  profileIdB: v.id("profiles"),
  status: vFriendshipStatus,
  initiatedBy: v.id("profiles"),
});

export { vProfile, vFriendship, vFriendshipStatus };
