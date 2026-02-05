import { useAuthStore } from "~/features/auth/store";

/**
 *
 * @param func - The function to call if the user is signed in.
 * @param redirectTo - The URL to redirect to if the user is not signed in.
 * @returns void.
 */
function useMaybeRedirect({
  func,
  redirectTo,
}: {
  func: () => void;
  redirectTo: string;
}) {
  const imNotSignedIn = useAuthStore((s) => s.imSignedOut);
  const setIsLoginModalOpen = useAuthStore((s) => s.setIsLoginModalOpen);
  const setRedirectURL = useAuthStore((s) => s.setRedirectURL);
  if (imNotSignedIn) {
    setIsLoginModalOpen(true);
    setRedirectURL(redirectTo);
    return;
  }
  func();
}

export { useMaybeRedirect };
