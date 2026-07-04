import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCompanyJobsWithCounts, closeJob } from "@/actions/jobs";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";

const statusBadge: Record<string, string> = {
  ACTIVE:  "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-100  text-gray-600",
  CLOSED:  "bg-red-100   text-red-700",
};

export default async function CompanyJobsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const jobs = await getCompanyJobsWithCounts(session.user.id);
  const now = new Date();

  const totalApplicants = jobs.reduce((sum, j) => sum + j.applicantCount, 0);
  const totalNew       = jobs.reduce((sum, j) => sum + j.newApplicantCount, 0);

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          {jobs.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              {jobs.length} job{jobs.length !== 1 ? "s" : ""} ·{" "}
              <span className="text-gray-700 font-medium">{totalApplicants} applicant{totalApplicants !== 1 ? "s" : ""}</span>
              {totalNew > 0 && (
                <span className="ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-bold">
                  +{totalNew} new today
                </span>
              )}
            </p>
          )}
        </div>
        {session.user.status === "ACTIVE" && (
          <Link
            href="/company/jobs/new"
            className="px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition"
          >
            + Post New Job
          </Link>
        )}
      </div>

      {/* ── Empty state ────────────────────────────────────── */}
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
            const hasNew = job.newApplicantCount > 0;

            return (
              <AnimatedGridItem key={job._id.toString()} className="block">
                <div className={`bg-white rounded-xl border p-5 transition-all ${hasNew ? "border-teal-300 shadow-sm shadow-teal-50" : "border-gray-100"}`}>
                  <div className="flex items-start justify-between gap-4">

                    {/* ── Left: job info ───────────────────── */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[effectiveStatus] ?? "bg-gray-100 text-gray-600"}`}>
                          {effectiveStatus}
                        </span>
                        {/* NEW badge — shown when applicants arrived in last 24h */}
                        {hasNew && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-bold animate-pulse">
                            ✦ NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job.location} · {job.jobType} · {job.category}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Deadline:{" "}
                        {new Date(job.deadline).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    {/* ── Right: applicant badge + actions ─── */}
                    <div className="flex flex-col items-end gap-3 shrink-0">

                      {/* Applicant count badge */}
                      <Link
                        href={`/company/jobs/${job._id}/applicants`}
                        className="flex items-center gap-2 group"
                        title="View applicants"
                      >
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all
                          ${hasNew
                            ? "bg-teal-50 border-teal-200 text-teal-700"
                            : "bg-gray-50 border-gray-200 text-gray-600 group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:text-teal-700"
                          }`}
                        >
                          {/* Person icon */}
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm font-bold">{job.applicantCount}</span>
                          <span className="text-xs font-medium">applicant{job.applicantCount !== 1 ? "s" : ""}</span>
                          {hasNew && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-teal-500 text-white text-[10px] font-bold leading-none">
                              +{job.newApplicantCount}
                            </span>
                          )}
                        </div>
                      </Link>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/company/jobs/${job._id}/applicants`}
                          className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                          Applicants
                        </Link>
                        {effectiveStatus === "ACTIVE" && (
                          <>
                            <Link
                              href={`/company/jobs/${job._id}/edit`}
                              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                              Edit
                            </Link>
                            <form
                              action={async () => {
                                "use server";
                                await closeJob(job._id.toString());
                              }}
                            >
                              <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                              >
                                Close
                              </button>
                            </form>
                          </>
                        )}
                      </div>
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
