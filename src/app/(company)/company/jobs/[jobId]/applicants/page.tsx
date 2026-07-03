import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getJobApplicants } from "@/actions/jobs";
import { reviewApplicant } from "@/actions/applications";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";

interface ApplicantsPageProps {
  params: Promise<{ jobId: string }>;
}

const statusBadge: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default async function ApplicantsPage({ params }: ApplicantsPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { jobId } = await params;
  const result = await getJobApplicants(jobId);

  if ("error" in result) redirect("/company/jobs");

  const { job, applicants } = result;

  return (
    <div>
      <div className="mb-6">
        <Link href="/company/jobs" className="text-sm text-teal-600 hover:underline">
          ← Back to jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">{job.title}</h1>
        <p className="text-sm text-gray-500">
          {applicants.length} applicant{applicants.length !== 1 ? "s" : ""} · sorted by match score
        </p>
      </div>

      {applicants.length === 0 ? (
        <EmptyState
          heading="No applicants yet"
          subtext="Applicants will appear here once they apply."
        />
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => {
            const seeker = app.seekerId as unknown as { _id: string; email: string };
            const profile = app.profile as {
              fullName?: string;
              experienceLevel?: string;
              skills?: string[];
              resumeUrl?: string;
              location?: string;
            } | null;

            return (
              <div
                key={app._id.toString()}
                className="bg-white rounded-xl border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {profile?.fullName ?? seeker?.email}
                      </h3>
                      {/* Match score bar */}
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: `${Math.round(app.score * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-teal-700 font-medium">
                          {Math.round(app.score * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Contact & Location */}
                    <div className="text-sm text-gray-500 mt-0.5 space-y-0.5">
                      {profile?.experienceLevel && (
                        <span>{profile.experienceLevel}</span>
                      )}
                      {(profile?.location || app.phone) && (
                        <span>
                          {profile?.experienceLevel ? " · " : ""}
                          {profile?.location ?? ""}
                          {app.phone ? ` (Tel: ${app.phone})` : ""}
                        </span>
                      )}
                    </div>

                    {profile?.skills && profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {profile.skills.slice(0, 6).map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 text-xs rounded"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Resume & Documents */}
                    <div className="flex gap-4 mt-3">
                      {(app.resumeUrl || profile?.resumeUrl) && (
                        <a
                          href={app.resumeUrl || profile?.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition"
                        >
                          📄 View Application Resume
                        </a>
                      )}
                    </div>

                    {/* Cover Letter */}
                    {app.coverLetter && (
                      <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm text-gray-700">
                        <strong className="block text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Cover Letter
                        </strong>
                        <p className="whitespace-pre-wrap leading-relaxed">{app.coverLetter}</p>
                      </div>
                    )}
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[app.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {app.status}
                  </span>
                </div>

                {/* Review form */}
                {(app.status === "PENDING" || app.status === "REVIEWED") && (
                  <details className="mt-4">
                    <summary className="text-sm text-teal-600 cursor-pointer hover:underline">
                      Review applicant
                    </summary>
                    <form
                      action={async (fd: FormData) => {
                        "use server";
                        await reviewApplicant(app._id.toString(), fd);
                      }}
                      className="mt-3 space-y-3"
                    >
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Message to applicant <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="message"
                          required
                          minLength={10}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                          placeholder="Explain your decision…"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          name="status"
                          value="APPROVED"
                          className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          type="submit"
                          name="status"
                          value="REJECTED"
                          className="px-4 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                        <button
                          type="submit"
                          name="status"
                          value="REVIEWED"
                          className="px-4 py-1.5 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
                        >
                          Mark Reviewed
                        </button>
                      </div>
                    </form>
                  </details>
                )}

                {app.message && (
                  <p className="mt-3 text-xs text-gray-500 italic">
                    Sent message: &ldquo;{app.message}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
