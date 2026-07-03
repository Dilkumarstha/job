import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSeekerApplications } from "@/actions/applications";
import EmptyState from "@/components/ui/EmptyState";
import ApplicationPipeline from "@/components/jobs/ApplicationPipeline";
import Link from "next/link";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  REVIEWED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  PENDING: "Applied",
  REVIEWED: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Not Selected",
};

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const applications = await getSeekerApplications(session.user.id);

  return (
    <div>
      {/* Header */}
      <AnimatedSection className="border-b border-gray-100 pb-5 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          My Applications
        </h1>
        <p className="text-base text-gray-500 mt-1">
          Track where you are in each company's hiring process.
        </p>
      </AnimatedSection>

      {applications.length === 0 ? (
        <div className="py-12">
          <EmptyState
            heading="No applications yet"
            subtext="Start applying to jobs from your feed or search."
            action={
              <Link
                href="/seeker/feed"
                className="px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition shadow-sm"
              >
                Browse jobs
              </Link>
            }
          />
        </div>
      ) : (
        <AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {applications.map((app) => {
            const job = app.jobId as unknown as {
              _id: string;
              title: string;
              location: string;
              jobType: string;
            };

            return (
              <AnimatedGridItem
                key={app._id.toString()}
                className="block"
              >
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition h-full">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/jobs/${job?._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-teal-700 transition"
                      >
                        {job?.title ?? "Job (removed)"}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {job?.location} · {job?.jobType}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Applied{" "}
                        {new Date(app.appliedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[app.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {statusLabel[app.status] ?? app.status}
                    </span>
                  </div>

                  {/* Progress pipeline */}
                  <ApplicationPipeline status={app.status} />

                  {/* Company message */}
                  {app.message && (app.status === "APPROVED" || app.status === "REJECTED") && (
                    <div
                      className={`mt-4 p-4 rounded-xl text-sm border ${app.status === "APPROVED"
                          ? "bg-green-50 border-green-200 text-green-800"
                          : "bg-red-50 border-red-200 text-red-800"
                        }`}
                    >
                      <div>
                        <p className="font-semibold mb-0.5">Message from company</p>
                        <p>{app.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedGridItem>
            );
          })}
        </AnimatedGrid>
      )}
    </div>
  );
}
