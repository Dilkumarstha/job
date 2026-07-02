import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveJobs } from "@/actions/jobs";
import { connectDB } from "@/lib/db";
import CompanyProfile from "@/models/CompanyProfile";
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from "@/lib/constants";
import JobCard from "@/components/jobs/JobCard";
import EmptyState from "@/components/ui/EmptyState";
import SearchFilters from "@/components/jobs/SearchFilters";
import TopSearchBar from "@/components/jobs/TopSearchBar";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";

// searchParams is async in Next.js 16
interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    category?: string;
    salaryMin?: string;
    salaryMax?: string;
    experienceLevel?: string;
    jobType?: string;
    sortBy?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;

  await connectDB();
  const [jobs, companyProfiles] = await Promise.all([
    getActiveJobs({
      q: params.q,
      location: params.location,
      category: params.category,
      salaryMin: params.salaryMin ? parseInt(params.salaryMin) : undefined,
      salaryMax: params.salaryMax ? parseInt(params.salaryMax) : undefined,
      experienceLevel: params.experienceLevel,
      jobType: params.jobType,
      sortBy: params.sortBy === "deadline" ? "deadline" : "latest",
    }),
    CompanyProfile.find().select("userId companyName").lean(),
  ]);

  const companyNameMap = new Map(
    companyProfiles.map((c) => [c.userId.toString(), c.companyName])
  );

  return (
    <div>
      {/* Top Search Bar — pre-filled with current keyword & location */}
      <div className="flex justify-center mb-8">
        <TopSearchBar
          defaultQ={params.q}
          defaultLocation={params.location}
          targetPath="/seeker/search"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filters */}
        <aside className="w-full md:w-64 shrink-0">
          <SearchFilters
            categories={[...JOB_CATEGORIES]}
            experienceLevels={[...EXPERIENCE_LEVELS]}
            jobTypes={[...JOB_TYPES]}
            current={{
              ...params,
              sortBy: params.sortBy === "deadline" ? "deadline" : "latest",
            }}
          />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-gray-100 pb-5 mb-6 gap-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {params.q ? `Results for "${params.q}"` : "All Jobs"}
              </h1>
              <p className="text-base text-gray-500 mt-1">
                {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </AnimatedSection>

          {jobs.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon="🔍"
                heading="No jobs match your search"
                subtext="Try different keywords or remove some filters."
              />
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <AnimatedGridItem key={job._id.toString()}>
                  <JobCard
                    job={{
                      ...job,
                      _id: job._id.toString(),
                      deadline: job.deadline,
                      companyId: job.companyId.toString(),
                    }}
                    companyName={companyNameMap.get(job.companyId.toString())}
                    showActions={session.user.role === "JOBSEEKER"}
                  />
                </AnimatedGridItem>
              ))}
            </AnimatedGrid>
          )}
        </div>
      </div>
    </div>
  );
}
