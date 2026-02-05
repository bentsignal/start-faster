import { createStore } from "rostra";

import type { Relationship, UIProfile } from "@acme/convex/types";

interface StoreProps {
  profile: UIProfile;
  relationship?: Relationship;
}

function useInternalStore({ profile, relationship }: StoreProps) {
  const { name, image, username, bio, link } = profile;
  return { name, image, username, bio, link, relationship };
}

export const { Store, useStore } = createStore(useInternalStore);
