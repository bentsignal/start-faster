import { createFileRoute } from "@tanstack/react-router";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";

import { ThemeToggle } from "~/features/theme/atoms/theme-toggle";

export const Route = createFileRoute("/_authenticated/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-base leading-none font-medium">Theme</p>
            <CardDescription className="max-w-md text-sm leading-6 text-balance sm:leading-5">
              Switch between light and dark mode.
            </CardDescription>
          </div>
          <ThemeToggle />
        </div>
      </CardContent>
    </Card>
  );
}
