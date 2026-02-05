import type { UIImage, UIPost } from "./types";
import { query } from "./_generated/server";
import { DeletedProfile, getPublicProfile } from "./profile";

export const getAll = query({
  args: {},
  handler: async (ctx): Promise<UIPost[]> => {
    const posts = await ctx.db.query("posts").order("desc").collect();
    const uiPosts = await Promise.all(
      posts.map(async (post) => {
        const profile = await ctx.db.get(post.profileId);
        const { imagesIds, ...rest } = post;
        const imageResults = await Promise.all(
          imagesIds.map(async (imageId) => {
            return await ctx.db.get(imageId);
          }),
        );
        const images = imageResults
          .filter((image) => image !== null)
          .map((image) => ({
            url: image.url,
          })) satisfies UIImage[];
        return {
          ...rest,
          creator: profile ? getPublicProfile(profile) : DeletedProfile,
          images,
        };
      }),
    );
    return uiPosts;
  },
});
