import { getPendingCompanies, approveCompany, rejectCompany } from "@/actions/admin";
import EmptyState from "@/components/ui/EmptyState";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";

export default async function AdminCompaniesPage() {
  const result = await getPendingCompanies();

  if ("error" in result) return <p className="text-red-500">{result.error}</p>;

  const { companies } = result;

  return (
    <div>
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pending Company Approvals</h1>
        <p className="text-sm text-gray-500 mb-6">
          {companies.length} company account{companies.length !== 1 ? "s" : ""} awaiting review
        </p>
      </AnimatedSection>

      {companies.length === 0 ? (
        <EmptyState heading="No pending companies" subtext="All company registrations have been reviewed." />
      ) : (
        <AnimatedGrid className="space-y-4">
          {companies.map((company) => {
            const profile = company.profile as { companyName?: string; industry?: string; website?: string; description?: string } | null;
            return (
              <AnimatedGridItem key={company._id.toString()} className="block">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{profile?.companyName ?? company.email}</h3>
                      <p className="text-sm text-gray-500">{company.email}</p>
                      {profile?.industry && <p className="text-sm text-gray-500">Industry: {profile.industry}</p>}
                      {profile?.website && (
                        <a href={profile.website} target="_blank" rel="noreferrer" className="text-sm text-teal-600 hover:underline">{profile.website}</a>
                      )}
                      {profile?.description && <p className="text-sm text-gray-600 mt-2 max-w-lg line-clamp-2">{profile.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">Registered {new Date(company.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <form action={async () => { "use server"; await approveCompany(company._id.toString()); }}>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition">Approve</button>
                      </form>
                      <form action={async () => { "use server"; await rejectCompany(company._id.toString(), "Registration rejected by admin"); }}>
                        <button type="submit" className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition">Reject</button>
                      </form>
                    </div>
                  </div>
                </div>
              </AnimatedGridItem>
            );
          })}
        </AnimatedGrid>
      )}
    </div>
  );
}
