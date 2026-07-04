import { auth, signOut } from "@/lib/auth";
import Navbar, { NavRole } from "@/components/Navbar";
import { connectDB } from "@/lib/db";
import SeekerProfile from "@/models/SeekerProfile";
import CompanyProfile from "@/models/CompanyProfile";

export default async function NavbarServer() {
  const session = await auth();
  const role = (session?.user?.role ?? null) as NavRole;

  let displayName = "";
  let avatarUrl = "";
  let initials = "?";
  let profileHref = "/";

  if (role === "JOBSEEKER" && session) {
    await connectDB();
    const profile = await SeekerProfile.findOne({ userId: session.user.id }).lean();
    displayName = (profile as { fullName?: string } | null)?.fullName ?? session.user.email;
    profileHref = "/seeker/profile";
    initials = displayName
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  } else if (role === "COMPANY" && session) {
    await connectDB();
    const profile = await CompanyProfile.findOne({ userId: session.user.id }).lean();
    const p = profile as { companyName?: string; logoUrl?: string } | null;
    displayName = p?.companyName ?? session.user.email;
    avatarUrl = p?.logoUrl ?? "";
    profileHref = "/company/profile";
    initials = displayName
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  } else if (role === "SUPERADMIN" && session) {
    displayName = session.user.email;
    profileHref = "/admin/dashboard";
    initials = session.user.email?.[0]?.toUpperCase() ?? "?";
  }

  const signOutSlot = (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button type="submit" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
        Sign out
      </button>
    </form>
  );

  return (
    <Navbar
      role={role}
      signOutSlot={signOutSlot}
      displayName={displayName}
      avatarUrl={avatarUrl}
      initials={initials}
      profileHref={profileHref}
    />
  );
}
