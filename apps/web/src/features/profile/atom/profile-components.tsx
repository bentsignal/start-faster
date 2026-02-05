import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useMutation, useQuery } from "convex/react";
import {
  Check,
  ChevronDown,
  Globe,
  PencilIcon,
  UserRound,
  UserRoundMinus,
  UserRoundPlus,
  X,
} from "lucide-react";

import { api } from "@acme/convex/api";
import { Button } from "@acme/ui/button";
import * as Dropdown from "@acme/ui/dropdown-menu";
import * as Tooltip from "@acme/ui/tooltip";

import type { PFPVariant } from "../types";
import { cn } from "~/utils/style-utils";
import {
  getPFPClassName,
  getPFPSizeNumber,
  normalizeProfileLink,
} from "../utils";
import { useStore as useProfileStore } from "./profile-store";

function PFP({
  className,
  variant = "sm",
}: {
  className?: string;
  variant?: PFPVariant;
}) {
  const image = useProfileStore((s) => s.image);
  const size = getPFPSizeNumber(variant);
  if (!image) return <BlankPFP className={className} variant={variant} />;
  return (
    <Image
      src={image}
      alt="Profile"
      width={size}
      height={size}
      layout="fixed"
      className={cn("rounded-full", getPFPClassName(variant), className)}
    />
  );
}

function BlankPFP({
  className,
  variant = "sm",
}: {
  className?: string;
  variant?: PFPVariant;
}) {
  return (
    <div
      className={cn(
        "bg-muted rounded-full",
        getPFPClassName(variant),
        className,
      )}
    />
  );
}

function Name({ className }: { className?: string }) {
  const name = useProfileStore((s) => s.name);
  return <span className={cn("text-foreground", className)}>{name}</span>;
}

function Username({ className }: { className?: string }) {
  const username = useProfileStore((s) => s.username);
  return (
    <span className={cn("text-muted-foreground", className)}>@{username}</span>
  );
}

function Bio({ className }: { className?: string }) {
  const bio = useProfileStore((s) => s.bio);
  if (!bio) return null;
  return <span className={cn("", className)}>{bio}</span>;
}

function UserProvidedLink({ className }: { className?: string }) {
  const link = useProfileStore((s) => s.link);
  if (!link) return null;
  const { href, display } = normalizeProfileLink(link);
  return (
    <Button
      variant="link"
      className={cn("text-muted-foreground h-fit w-fit p-0!", className)}
      asChild
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="User's website (external link that opens in new tab)"
      >
        <Globe className="size-4" />
        {display}
      </a>
    </Button>
  );
}

function PrimaryButton({ className }: { className?: string }) {
  const initialStatus = useProfileStore((s) => s.relationship);
  const username = useProfileStore((s) => s.username);
  const reactiveStatus = useQuery(api.friends.getRelationship, { username });
  const relationship =
    reactiveStatus?.relationship === undefined
      ? initialStatus
      : reactiveStatus.relationship;
  if (relationship === undefined) return null;
  if (relationship === "my-profile") {
    return <EditProfileButton className={className} />;
  }
  if (relationship === "pending-incoming") {
    return <IncomingRequestButton className={className} />;
  }
  if (relationship === "pending-outgoing") {
    return <OutgoingRequestButton className={className} />;
  }
  if (relationship === "friends") {
    return <FriendsButton className={className} />;
  }
  return <AddFriendButton className={className} />;
}

function EditProfileButton({ className }: { className?: string }) {
  return (
    <Button className={cn("rounded-full", className)} asChild>
      <Link to="/edit-profile" preload="intent">
        <PencilIcon className="size-4" />
        Edit Profile
      </Link>
    </Button>
  );
}

function IncomingRequestButton({ className }: { className?: string }) {
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest);
  const ignoreFriendRequest = useMutation(api.friends.ignoreFriendRequest);
  const username = useProfileStore((s) => s.username);
  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <span className="text-muted-foreground">Incoming friend request</span>
      <div className="ml-auto flex flex-row gap-2 lg:ml-0">
        <Tooltip.Container>
          <Tooltip.Trigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => ignoreFriendRequest({ username })}
            >
              <X className="size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <span>Ignore friend request</span>
          </Tooltip.Content>
        </Tooltip.Container>
        <Tooltip.Container>
          <Tooltip.Trigger asChild>
            <Button
              size="icon"
              className="bg-green-300 hover:bg-green-300/90 dark:bg-green-600 dark:hover:bg-green-600/90"
              onClick={() => acceptFriendRequest({ username })}
            >
              <Check className="text-foreground size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <span>Accept friend request</span>
          </Tooltip.Content>
        </Tooltip.Container>
      </div>
    </div>
  );
}

function OutgoingRequestButton({ className }: { className?: string }) {
  const cancelFriendRequest = useMutation(api.friends.cancelFriendRequest);
  const username = useProfileStore((s) => s.username);
  return (
    <div className={cn("flex flex-row items-center gap-2", className)}>
      <span className="text-muted-foreground">Friend request sent</span>
      <div className="ml-auto flex flex-row gap-2 lg:ml-0">
        <Tooltip.Container>
          <Tooltip.Trigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => cancelFriendRequest({ username })}
            >
              <X className="size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <span>Cancel friend request</span>
          </Tooltip.Content>
        </Tooltip.Container>
      </div>
    </div>
  );
}

function FriendsButton({ className }: { className?: string }) {
  return (
    <Dropdown.Container>
      <Dropdown.Trigger asChild>
        <Button
          variant="outline"
          className={cn("gap-2 rounded-full", className)}
        >
          <UserRound className="size-4" />
          <span>Friends</span>
          <ChevronDown className="size-4" />
        </Button>
      </Dropdown.Trigger>
      <Dropdown.Content className="w-56 pb-2">
        <Dropdown.Group>
          <Dropdown.Label className="text-muted-foreground text-xs">
            Actions
          </Dropdown.Label>
          <Dropdown.Item asChild>
            <RemoveFriendButton />
          </Dropdown.Item>
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Container>
  );
}

function RemoveFriendButton() {
  const removeFriend = useMutation(api.friends.removeFriend);
  const username = useProfileStore((s) => s.username);
  const [showConfirmation, setShowConfirmation] = useState(false);
  if (showConfirmation) {
    return (
      <div className="flex w-full flex-row items-center justify-between gap-2 px-2">
        <span className="text-muted-foreground text-sm">Are you sure?</span>
        <div className="ml-auto flex flex-row gap-2 lg:ml-0">
          <Tooltip.Container>
            <Tooltip.Trigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowConfirmation(false)}
              >
                <X className="size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span>Cancel</span>
            </Tooltip.Content>
          </Tooltip.Container>
          <Tooltip.Container>
            <Tooltip.Trigger asChild>
              <Button
                size="icon"
                className="bg-red-300 hover:bg-red-300/90 dark:bg-red-600 dark:hover:bg-red-600/90"
                onClick={() => removeFriend({ username })}
              >
                <UserRoundMinus className="text-foreground size-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span>Remove friend</span>
            </Tooltip.Content>
          </Tooltip.Container>
        </div>
      </div>
    );
  }
  return (
    <Button variant="link" onClick={() => setShowConfirmation(true)}>
      <UserRoundMinus className="size-4 text-red-500" />
      Remove friend
    </Button>
  );
}

function AddFriendButton({ className }: { className?: string }) {
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);
  const username = useProfileStore((s) => s.username);
  return (
    <Button
      className={cn("rounded-full", className)}
      onClick={() => sendFriendRequest({ username })}
    >
      <UserRoundPlus className="size-4" />
      Add friend
    </Button>
  );
}

export { PFP, BlankPFP, Name, Username, Bio, UserProvidedLink, PrimaryButton };
