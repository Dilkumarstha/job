import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import Application from "@/models/Application";
import CompanyProfile from "@/models/CompanyProfile";
import Link from "next/link";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";

export default async function CompanyDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  await connectDB();

  const now = new Date();

  const [profile, activeJobs, totalApplicants, recentApplications] =
    await Promise.all([
      CompanyProfile.findOne({ userId: session.user.id }).lean(),
      Job.countDocuments({
        companyId: session.user.id,
        status: "ACTIVE",
        deadline: { $gt: now },
      }),
      Application.countDocuments({
        jobId: {
          $in: await Job.find({ companyId: session.user.id }).distinct("_id"),
        },
      }),
      Application.find({
        jobId: {
          $in: await Job.find({ companyId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(10)
            .distinct("_id"),
        },
      })
        .sort({ appliedAt: -1 })
        .limit(5)
        .populate("jobId", "title")
        .populate("seekerId", "email")
        .lean(),
    ]);

  const stats = [
    { label: "Active Jobs", value: activeJobs },
    { label: "Total Applicants", value: totalApplicants },
  ];

  return (
    <div>
      <AnimatedSection className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profile?.companyName ?? "Company Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your jobs and applicants</p>
        </div>
        {session.user.status === "ACTIVE" && (
          <Link
            href="/company/jobs/new"
            className="px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition"
          >
            + Post Job
          </Link>
        )}
      </AnimatedSection>

      {/* Stats */}
      <AnimatedGrid className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((s) => (
          <AnimatedGridItem key={s.label}>
            <div className="bg-white rounded-xl border border-gray-100 p-5 h-full">
              <div className="text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          </AnimatedGridItem>
        ))}
      </AnimatedGrid>

      {/* Recent applications */}
      <AnimatedSection delay={0.15} className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Applications</h2>
          <Link href="/company/jobs" className="text-sm text-teal-600 hover:underline">
            View all jobs →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <p className="text-sm text-gray-400">No applications yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentApplications.map((app) => {
              const job = app.jobId as unknown as { title: string };
              const seeker = app.seekerId as unknown as { email: string };
              return (
                <div key={app._id.toString()} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{seeker?.email}</p>
                    <p className="text-xs text-gray-500">{job?.title}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      app.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : app.status === "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
