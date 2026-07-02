import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import CompanyProfile from "@/models/CompanyProfile";
import { CompanyProfileForm } from "./ProfileForm";

export default async function CompanyProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();
  const profile = await CompanyProfile.findOne({ userId: session.user.id }).lean();

  const profileData = profile ?? {
    companyName: "",
    description: "",
    logoUrl: "",
    industry: "",
    website: "",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Company Profile</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <CompanyProfileForm profile={profileData} userId={session.user.id} />
      </div>
    </div>
  );
}
