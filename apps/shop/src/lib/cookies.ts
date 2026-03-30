export function getClientCookie(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const encodedPrefix = `${encodeURIComponent(name)}=`;
  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(encodedPrefix));
  return cookieEntry?.slice(encodedPrefix.length);
}
