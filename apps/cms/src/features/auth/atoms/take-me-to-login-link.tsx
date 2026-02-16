import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

import { Button } from "@acme/ui/button";

export function TakeMeToLoginLink() {
  return (
    <Button variant="link" className="px-0!" asChild>
      <Link
        to="."
        search={(prev) => ({ ...prev, showLogin: true })}
        preload="intent"
      >
        <LogIn size={16} />
        <span>Take me to login</span>
      </Link>
    </Button>
  );
}
