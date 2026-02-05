import * as Auth from "~/features/auth/atom";

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
  const imNotSignedIn = Auth.useStore((s) => s.imSignedOut);
  const setIsLoginModalOpen = Auth.useStore((s) => s.setIsLoginModalOpen);
  const setRedirectURL = Auth.useStore((s) => s.setRedirectURL);
  if (imNotSignedIn) {
    setIsLoginModalOpen(true);
    setRedirectURL(redirectTo);
    return;
  }
  func();
}

export { useMaybeRedirect };
