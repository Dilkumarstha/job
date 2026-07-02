import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import SeekerProfile from "@/models/SeekerProfile";
import CompanyProfile from "@/models/CompanyProfile";
import CompanyFollow from "@/models/CompanyFollow";
import User from "@/models/User";
import Job from "@/models/Job";
import { getActiveJobs } from "@/actions/jobs";
import { matchScore } from "@/lib/matchScore";
import HomePageClient from "./HomePageClient";

export default async function HomePage() {
  const session = await auth();
  await connectDB();

  // Aggregate: companies with active jobs and how many
  const activeCompanyAgg: Array<{ _id: string; count: number }> = await Job.aggregate([
    { $match: { status: "ACTIVE", deadline: { $gt: new Date() } } },
    { $group: { _id: "$companyId", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  const hiringCompanyIds = activeCompanyAgg.map((a) => a._id.toString());

  const [jobs, companyProfiles, hiringUsers] = await Promise.all([
    getActiveJobs(),
    CompanyProfile.find().select("userId companyName logoUrl industry").lean(),
    User.find({ _id: { $in: hiringCompanyIds }, status: "ACTIVE", deletedAt: null })
      .select("_id")
      .lean(),
  ]);

  const activeHiringIds = new Set(hiringUsers.map((u) => u._id.toString()));

  // Build hiring companies list (only approved/active companies)
  const hiringCompanies = activeCompanyAgg
    .filter((a) => activeHiringIds.has(a._id.toString()))
    .map((a) => {
      const profile = companyProfiles.find((p) => p.userId.toString() === a._id.toString());
      return {
        id: a._id.toString(),
        companyName: profile?.companyName ?? "Unknown",
        logoUrl: profile?.logoUrl ?? "",
        industry: profile?.industry ?? "",
        jobCount: a.count,
      };
    });

  const companyNameMap = new Map(
    companyProfiles.map((c) => [c.userId.toString(), c.companyName])
  );

  // If user is logged in as a seeker, we compute personalized match scores
  let scoredJobs: Array<{ job: any; score?: number }> = [];
  let isSeeker = false;

  if (session?.user?.role === "JOBSEEKER") {
    isSeeker = true;
    const profile = await SeekerProfile.findOne({ userId: session.user.id }).lean();
    const follows = await CompanyFollow.find({ seekerId: session.user.id }).lean();
    const followedIds = new Set(follows.map((f) => f.companyId.toString()));

    if (profile && profile.interests.length > 0) {
      const seekerInput = {
        skills: profile.skills,
        interests: profile.interests,
        experienceLevel: profile.experienceLevel,
        location: profile.location,
      };

      scoredJobs = jobs
        .map((job) => ({
          job,
          score: matchScore(
            seekerInput,
            {
              companyId: job.companyId.toString(),
              category: job.category,
              skillsRequired: job.skillsRequired,
              experienceLevel: job.experienceLevel,
              location: job.location,
              jobType: job.jobType,
              createdAt: job.createdAt,
            },
            followedIds
          ),
        }))
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else {
      // Fallback if they haven't finished onboarding
      scoredJobs = jobs.map((job) => ({ job }));
    }
  } else {
    // Guest or other roles: unranked jobs
    scoredJobs = jobs.map((job) => ({ job }));
  }

  const companyNameMapObj = Object.fromEntries(companyNameMap);

  return (
    <HomePageClient
      isSeeker={isSeeker}
      scoredJobs={scoredJobs}
      hiringCompanies={hiringCompanies}
      jobsCount={jobs.length}
      companyNameMap={companyNameMapObj}
      session={session}
    />
  );
}