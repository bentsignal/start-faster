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

const vTrip = v.object({
  creatorId: v.id("profiles"),
  name: v.string(),
  imageId: v.optional(v.id("images")),
  description: v.optional(v.string()),
  location: v.optional(v.string()),
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
});

const vImage = v.object({
  url: v.string(),
  alt: v.optional(v.string()),
});

const vPost = v.object({
  tripId: v.id("trips"),
  profileId: v.id("profiles"),
  imagesIds: v.array(v.id("images")),
  caption: v.optional(v.string()),
});

export { vProfile, vPost, vTrip, vImage, vFriendship, vFriendshipStatus };
