import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import CompanyProfile from "@/models/CompanyProfile";
import Application from "@/models/Application";
import { auth } from "@/lib/auth";
import User from "@/models/User";
import ApplyButton from "./ApplyButton";
import RelatedJobsSection from "@/components/jobs/RelatedJobsSection";

interface JobDetailPageProps {
  params: Promise<{ jobId: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { jobId } = await params;

  await connectDB();

  const job = await Job.findById(jobId).lean();
  if (!job) notFound();

  const companyUser = await User.findOne({
    _id: job.companyId,
    role: "COMPANY",
    status: "ACTIVE",
    deletedAt: null,
  }).lean();
  if (!companyUser) notFound();

  const company = await CompanyProfile.findOne({
    userId: job.companyId,
  }).lean();

  const session = await auth();
  const isSeeker = session?.user?.role === "JOBSEEKER";
  const isExpired =
    new Date(job.deadline) < new Date() || job.status !== "ACTIVE";

  // Fetch existing application status (null if none)
  const existingApplication = isSeeker
    ? await Application.findOne({ jobId: job._id, seekerId: session!.user.id }).select("status").lean()
    : null;
  const applicationStatus = (existingApplication?.status ?? null) as
    | "PENDING" | "REVIEWED" | "APPROVED" | "REJECTED" | null;

  // Fetch related jobs: same company (excluding current) + similar (same category or overlapping skills)
  const now = new Date();

  const [sameCompanyRaw, similarRaw, allCompanyProfiles] = await Promise.all([
    Job.find({
      _id: { $ne: job._id },
      companyId: job.companyId,
      status: "ACTIVE",
      deadline: { $gt: now },
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),

    Job.find({
      _id: { $ne: job._id },
      status: "ACTIVE",
      deadline: { $gt: now },
      $or: [
        { category: job.category },
        { skillsRequired: { $in: job.skillsRequired } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),

    CompanyProfile.find().select("userId companyName").lean(),
  ]);

  const companyNameMap = new Map(
    allCompanyProfiles.map((c) => [c.userId.toString(), c.companyName])
  );

  const serialiseJob = (j: typeof sameCompanyRaw[number]) => ({
    _id: j._id.toString(),
    title: j.title,
    category: j.category,
    location: j.location,
    jobType: j.jobType,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    experienceLevel: j.experienceLevel,
    deadline: j.deadline.toISOString(),
    companyId: j.companyId.toString(),
    skillsRequired: j.skillsRequired,
    companyName: companyNameMap.get(j.companyId.toString()),
  });

  const sameCompanyJobs = sameCompanyRaw.map(serialiseJob);
  const similarJobs = similarRaw.map(serialiseJob);

  const jobTypeBadge: Record<string, string> = {
    REMOTE: "bg-green-100 text-green-700",
    ONSITE: "bg-blue-100 text-blue-700",
    HYBRID: "bg-purple-100 text-purple-700",
  };

  const salaryText =
    job.salaryMin && job.salaryMax
      ? `$${(job.salaryMin / 1000).toFixed(0)}k – $${(job.salaryMax / 1000).toFixed(0)}k / year`
      : job.salaryMin
        ? `From $${(job.salaryMin / 1000).toFixed(0)}k / year`
        : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-700">
            HireHub
          </Link>
          <div className="flex gap-3">
            {session ? (
              <Link
                href={
                  session.user.role === "JOBSEEKER"
                    ? "/seeker/feed"
                    : session.user.role === "COMPANY"
                      ? "/company/dashboard"
                      : "/admin/dashboard"
                }
                className="px-4 py-1.5 text-sm font-medium text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup/seeker"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-700 rounded-lg hover:bg-indigo-800 transition"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start gap-4">
                {/* Company logo / placeholder */}
                <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl shrink-0 border border-indigo-100">
                  {company?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.logoUrl}
                      alt={company.companyName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    "🏢"
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  <p className="text-gray-600 mt-0.5">
                    <Link
                      href={`/companies/${job.companyId}`}
                      className="hover:text-indigo-700 hover:underline transition"
                    >
                      {company?.companyName ?? "Company"}
                    </Link>
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${jobTypeBadge[job.jobType] ?? "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {job.jobType}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      📍 {job.location}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {job.experienceLevel}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      {job.category}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isExpired ? "bg-red-100 text-red-600" : "bg-orange-50 text-orange-600"}`}>
                      🗓 {isExpired ? "Expired" : "Deadline"}:{" "}
                      {new Date(job.deadline).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {isExpired && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                        Expired
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Job Description
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>

            {/* Skills */}
            {job.skillsRequired.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-4">
              {salaryText && (
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {salaryText}
                </p>
              )}

              <div className="text-sm text-gray-500 mb-5">
                Deadline:{" "}
                <span className={isExpired ? "text-red-500 font-medium" : "text-gray-700 font-medium"}>
                  {new Date(job.deadline).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {isSeeker && !isExpired && (
                <ApplyButton
                  jobId={job._id.toString()}
                  jobTitle={job.title}
                  companyName={company?.companyName}
                  initialStatus={applicationStatus}
                />
              )}

              {!session && !isExpired && (
                <Link
                  href={`/login`}
                  className="block w-full py-2.5 text-center bg-indigo-700 text-white text-sm font-semibold rounded-xl hover:bg-indigo-800 transition"
                >
                  Sign in to apply
                </Link>
              )}

              {isExpired && (
                <p className="text-sm text-red-500 text-center font-medium">
                  This position is no longer accepting applications
                </p>
              )}

              {session?.user?.role === "JOBSEEKER" && (
                <Link
                  href="/seeker/feed"
                  className="block w-full mt-3 py-2 text-center text-sm text-gray-500 hover:text-gray-700 transition"
                >
                  ← Back to feed
                </Link>
              )}
            </div>

            {/* Company info */}
            {company && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  About {company.companyName}
                </h3>
                {company.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-4">
                    {company.description}
                  </p>
                )}
                {company.industry && (
                  <p className="text-xs text-gray-500">
                    Industry: {company.industry}
                  </p>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-xs text-indigo-600 hover:underline"
                  >
                    {company.website} ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related jobs section */}
        <RelatedJobsSection
          sameCompanyJobs={sameCompanyJobs}
          similarJobs={similarJobs}
          currentJobId={job._id.toString()}
        />
      </main>
    </div>
  );
}
