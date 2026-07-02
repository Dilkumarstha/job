import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import SavedJob from "@/models/SavedJob";
import Job from "@/models/Job";
import User from "@/models/User";
import JobCard from "@/components/jobs/JobCard";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";

export default async function SavedJobsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  const saved = await SavedJob.find({ seekerId: session.user.id }).lean();
  const jobIds = saved.map((s) => s.jobId);

  const activeCompanies = await User.find({
    role: "COMPANY",
    status: "ACTIVE",
    deletedAt: null,
  }).select("_id").lean();
  const activeCompanyIds = activeCompanies.map((c) => c._id);

  const jobs = await Job.find({
    _id: { $in: jobIds },
    companyId: { $in: activeCompanyIds },
  }).lean();

  return (
    <div>
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>
      </AnimatedSection>

      {jobs.length === 0 ? (
        <EmptyState
          icon="⭐"
          heading="No saved jobs yet"
          subtext="Save jobs from your feed or search to find them here."
          action={
            <Link
              href="/seeker/feed"
              className="px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition"
            >
              Browse jobs
            </Link>
          }
        />
      ) : (
        <AnimatedGrid className="space-y-4">
          {jobs.map((job) => (
            <AnimatedGridItem key={job._id.toString()} className="block">
              <JobCard
                job={{
                  ...job,
                  _id: job._id.toString(),
                  deadline: job.deadline,
                  companyId: job.companyId.toString(),
                }}
                isSaved
                showActions
              />
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      )}
    </div>
  );
}
