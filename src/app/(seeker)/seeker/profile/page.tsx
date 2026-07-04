import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import SeekerProfile from "@/models/SeekerProfile";
import Application from "@/models/Application";
import SavedJob from "@/models/SavedJob";
import SeekerProfileForm from "./ProfileForm";
import ProfileShell from "./ProfileShell";
import ChangePasswordForm from "@/components/ChangePassword";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  const [profile, totalApplications, savedCount, approvedCount] = await Promise.all([
    SeekerProfile.findOne({ userId: session.user.id }).lean(),
    Application.countDocuments({ seekerId: session.user.id }),
    SavedJob.countDocuments({ seekerId: session.user.id }),
    Application.countDocuments({ seekerId: session.user.id, status: "APPROVED" }),
  ]);

  const profileData = profile ?? {
    fullName: "",
    bio: "",
    resumeUrl: "",
    experienceLevel: undefined,
    location: "",
    skills: [] as string[],
    interests: [] as string[],
  };

  const initials = profileData.fullName
    ? profileData.fullName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : session.user.email?.[0]?.toUpperCase() ?? "?";

  const profileCompleteness = (() => {
    let score = 0;
    if (profileData.fullName) score += 20;
    if (profileData.bio) score += 20;
    if (profileData.location) score += 15;
    if (profileData.experienceLevel) score += 15;
    if ((profileData.skills ?? []).length > 0) score += 15;
    if ((profileData.interests ?? []).length > 0) score += 10;
    if (profileData.resumeUrl) score += 5;
    return score;
  })();

  return (
    <ProfileShell
      initials={initials}
      fullName={profileData.fullName}
      location={profileData.location ?? undefined}
      experienceLevel={profileData.experienceLevel ?? undefined}
      resumeUrl={profileData.resumeUrl ?? undefined}
      profileCompleteness={profileCompleteness}
      totalApplications={totalApplications}
      savedCount={savedCount}
      approvedCount={approvedCount}
      skills={profileData.skills ?? []}
      interests={profileData.interests ?? []}
    >
      <div className="space-y-6">
        <SeekerProfileForm profile={profileData} userId={session.user.id} />
        <ChangePasswordForm />
      </div>
    </ProfileShell>
  );
}
