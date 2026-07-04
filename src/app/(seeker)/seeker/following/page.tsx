import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import CompanyFollow from "@/models/CompanyFollow";
import User from "@/models/User";
import CompanyProfile from "@/models/CompanyProfile";
import Link from "next/link";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";
import EmptyState from "@/components/ui/EmptyState";

export default async function FollowingPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  const follows = await CompanyFollow.find({ seekerId: session.user.id }).lean();
  const companyIds = follows.map((f) => f.companyId);

  const companies = await User.find({
    _id: { $in: companyIds },
    role: "COMPANY",
    status: "ACTIVE",
    deletedAt: null,
  }).lean();

  const profiles = await CompanyProfile.find({
    userId: { $in: companies.map((c) => c._id) },
  }).lean();

  const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

  const followedCompanies = companies
    .map((company) => ({
      _id: company._id.toString(),
      email: company.email,
      createdAt: company.createdAt,
      profile: profileMap.get(company._id.toString()),
    }))
    .sort((a, b) => {
      const aFollow = follows.find((f) => f.companyId.toString() === a._id);
      const bFollow = follows.find((f) => f.companyId.toString() === b._id);
      return bFollow!.createdAt.getTime() - aFollow!.createdAt.getTime();
    });

  return (
    <div>
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Followed Companies</h1>
      </AnimatedSection>

      {followedCompanies.length === 0 ? (
        <EmptyState
          heading="Not following any companies yet"
          subtext="Follow companies from their profile pages to get notified when they post new jobs."
          action={
            <Link
              href="/seeker/search"
              className="px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition"
            >
              Browse companies
            </Link>
          }
        />
      ) : (
        <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followedCompanies.map((company) => (
            <AnimatedGridItem key={company._id}>
              <Link
                href={`/companies/${company._id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm hover:border-gray-200 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-lg font-bold text-teal-700 shrink-0">
                    {(company.profile?.companyName ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {company.profile?.companyName ?? "Unknown Company"}
                    </h3>
                    {company.profile?.industry && (
                      <p className="text-xs text-gray-500 mt-0.5">{company.profile.industry}</p>
                    )}
                  </div>
                </div>
                {company.profile?.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {company.profile.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">Following since</span>
                  <span className="text-xs font-medium text-gray-600">
                    {new Date(
                      follows.find((f) => f.companyId.toString() === company._id)!.createdAt
                    ).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </Link>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      )}
    </div>
  );
}
