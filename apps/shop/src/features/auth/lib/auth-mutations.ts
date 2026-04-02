import { mutationOptions } from "@tanstack/react-query";

export const authMutations = {
  signOut: () =>
    mutationOptions({
      mutationKey: ["auth", "sign-out"] as const,
      mutationFn: async () => {
        const response = await fetch("/logout", {
          method: "POST",
          redirect: "manual",
        });

        if (response.type === "opaqueredirect") {
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to sign out.");
        }
      },
    }),
};
