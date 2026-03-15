import { House } from "lucide-react";

import { Button } from "@acme/ui/button";

import { Link } from "~/components/link";

export function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-bold">Sorry about that</h1>
      <p className="text-muted-foreground">
        We couldn't find the page you're looking for.
      </p>
      <Button
        className="mt-1"
        render={(props) => (
          <Link to="/" {...props}>
            <House className="size-4" />
            Back to home
          </Link>
        )}
      />
    </div>
  );
}
