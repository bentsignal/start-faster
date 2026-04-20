import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { CopyPlus, Eye } from "lucide-react";

import type { Id } from "@acme/convex/model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@acme/ui/dropdown-menu";

import { useCreateDraftFromVersion } from "~/features/pages/hooks/use-create-draft-from-version";
import { useNavigateToPageHubTab } from "~/features/pages/hooks/use-navigate-to-page-hub-tab";
import { EllipsisTrigger } from "./ellipsis-trigger";

function useReleaseActionsMenu({
  releaseId,
}: {
  releaseId: Id<"pageReleases">;
}) {
  const pageId = useRouteContext({
    from: "/_authenticated/_authorized/pages/$pageId",
    select: (ctx) => ctx.pageId,
  });
  const navigate = useNavigate();
  const { mutate: createDraft } = useCreateDraftFromVersion();
  const navigateToTab = useNavigateToPageHubTab();

  function handlePreview() {
    void navigate({
      to: "/pages/$pageId/release/$releaseId",
      params: { pageId, releaseId },
      search: (prev) => prev,
    });
  }

  function handleCreateDraftFromRelease() {
    createDraft(
      { pageId, source: { kind: "release", releaseId } },
      {
        onSuccess: () => {
          void navigateToTab("drafts");
        },
      },
    );
  }

  return { handlePreview, handleCreateDraftFromRelease };
}

export function ReleaseActionsMenu({
  releaseId,
  isOpen,
  setOpen,
}: {
  releaseId: Id<"pageReleases">;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { handlePreview, handleCreateDraftFromRelease } = useReleaseActionsMenu(
    { releaseId },
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setOpen}>
      <EllipsisTrigger />
      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-64"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={handlePreview}
            className="hover:cursor-pointer"
          >
            <Eye className="size-3.5" />
            Preview
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleCreateDraftFromRelease}
            className="hover:cursor-pointer"
          >
            <CopyPlus className="size-3.5" />
            New draft from this version
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
