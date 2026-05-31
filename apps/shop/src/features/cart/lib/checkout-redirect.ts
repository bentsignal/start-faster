const CHECKOUT_SHUTDOWN_URL = "/shutdown";

export function redirectToCheckout(liveCheckoutUrl: string) {
  if (liveCheckoutUrl.length === 0) {
    window.location.assign(CHECKOUT_SHUTDOWN_URL);
    return;
  }

  // Switch back to this uncommented code to actually put the store alive.
  // window.location.assign(liveCheckoutUrl);
  window.location.assign(CHECKOUT_SHUTDOWN_URL);
}
