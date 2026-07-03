import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCompanyJobs, closeJob } from "@/actions/jobs";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";

const statusBadge: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-100 text-gray-600",
  CLOSED: "bg-red-100 text-red-700",
};

export default async function CompanyJobsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const jobs = await getCompanyJobs(session.user.id);
  const now = new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        {session.user.status === "ACTIVE" && (
          <Link
            href="/company/jobs/new"
            className="px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition"
          >
            + Post New Job
          </Link>
        )}
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          heading="No jobs posted yet"
          subtext="Post your first job to start receiving applications."
          action={
            session.user.status === "ACTIVE" ? (
              <Link
                href="/company/jobs/new"
                className="px-4 py-2 bg-teal-700 text-white text-sm font-medium rounded-lg hover:bg-teal-800 transition"
              >
                Post a job
              </Link>
            ) : undefined
          }
        />
      ) : (
        <AnimatedGrid className="space-y-4">
          {jobs.map((job) => {
            const isExpired = new Date(job.deadline) < now || job.status === "EXPIRED";
            const effectiveStatus = isExpired && job.status === "ACTIVE" ? "EXPIRED" : job.status;

            return (
              <AnimatedGridItem key={job._id.toString()} className="block">
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[effectiveStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {effectiveStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{job.location} · {job.jobType} · {job.category}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Deadline: {new Date(job.deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/company/jobs/${job._id}/applicants`} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        Applicants
                      </Link>
                      {effectiveStatus === "ACTIVE" && (
                        <>
                          <Link href={`/company/jobs/${job._id}/edit`} className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            Edit
                          </Link>
                          <form action={async () => { "use server"; await closeJob(job._id.toString()); }}>
                            <button type="submit" className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition">
                              Close
                            </button>
                          </form>
                        </>
                      )}
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
