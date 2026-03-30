import { Package, Settings, User } from "lucide-react";

export const navItems = [
  { icon: User, label: "Account", to: "/account" },
  { icon: Package, label: "Orders", to: "/orders" },
  { icon: Settings, label: "Settings", to: "/settings" },
] as const;

export function getSelectedRoute(pathname: string) {
  const matchingItem = navItems.find((item) => pathname.startsWith(item.to));
  if (matchingItem !== undefined) {
    return matchingItem.to;
  }

  return "/orders";
}
