import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_tabs/edit-profile")({
  beforeLoad: ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/",
        search: { showLogin: true, redirectTo: "/edit-profile" },
      });
    }
  },
  component: EditProfilePage,
});

function EditProfilePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-foreground text-2xl font-bold">Edit Profile</h1>
    </div>
  );
}
