"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Job from "@/models/Job";
import CompanyFollow from "@/models/CompanyFollow";
import Application from "@/models/Application";
import SeekerProfile from "@/models/SeekerProfile";
import { createJobSchema, updateJobSchema } from "@/lib/validations/job";
import { createBulkNotifications } from "@/lib/notifications";
import { matchScore } from "@/lib/matchScore";
import User from "@/models/User";

async function requireCompany() {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") throw new Error("Unauthorized");
  if (session.user.status !== "ACTIVE") throw new Error("Company not approved");
  return session;
}

export async function createJob(formData: FormData) {
  const session = await requireCompany();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    skillsRequired: formData.getAll("skillsRequired"),
    experienceLevel: formData.get("experienceLevel"),
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    location: formData.get("location"),
    jobType: formData.get("jobType"),
    deadline: formData.get("deadline"),
  };

  const result = createJobSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await connectDB();

  const job = await Job.create({
    ...result.data,
    companyId: session.user.id,
    status: "ACTIVE",
  });

  // Notify followers about the new job
  const follows = await CompanyFollow.find({ companyId: session.user.id }).lean();
  const followerIds = follows.map((f) => f.seekerId);

  if (followerIds.length > 0) {
    await createBulkNotifications(
      followerIds,
      "NEW_JOB_POSTED",
      `A company you follow just posted a new job: "${result.data.title}"`
    );
  }

  revalidatePath("/company/jobs");
  redirect("/company/jobs");
}

export async function updateJob(jobId: string, formData: FormData) {
  const session = await requireCompany();

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    skillsRequired: formData.getAll("skillsRequired"),
    experienceLevel: formData.get("experienceLevel"),
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    location: formData.get("location"),
    jobType: formData.get("jobType"),
    deadline: formData.get("deadline"),
    status: formData.get("status") || undefined,
  };

  const result = updateJobSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await connectDB();

  const job = await Job.findOne({ _id: jobId, companyId: session.user.id });
  if (!job) return { error: "Job not found or access denied" };

  await Job.findByIdAndUpdate(jobId, result.data);

  revalidatePath(`/company/jobs/${jobId}/edit`);
  revalidatePath("/company/jobs");
  redirect("/company/jobs");
}

export async function closeJob(jobId: string) {
  const session = await requireCompany();
  await connectDB();

  const job = await Job.findOne({ _id: jobId, companyId: session.user.id });
  if (!job) return { error: "Job not found or access denied" };

  await Job.findByIdAndUpdate(jobId, { status: "CLOSED" });

  revalidatePath("/company/jobs");
  return { ok: true };
}

export async function getCompanyJobs(companyId: string) {
  await connectDB();
  const jobs = await Job.find({ companyId }).sort({ createdAt: -1 }).lean();
  return jobs;
}

export async function getJobApplicants(jobId: string) {
  const session = await requireCompany();
  await connectDB();

  const job = await Job.findOne({ _id: jobId, companyId: session.user.id }).lean();
  if (!job) return { error: "Job not found or access denied" };

  const applications = await Application.find({ jobId })
    .populate("seekerId", "_id email")
    .sort({ appliedAt: -1 })
    .lean();

  const seekerIds = applications.map((a) => a.seekerId);

  const profiles = await SeekerProfile.find({ userId: { $in: seekerIds } }).lean();
  const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

  // Compute match scores for each applicant
  const jobInput = {
    companyId: job.companyId.toString(),
    category: job.category,
    skillsRequired: job.skillsRequired,
    experienceLevel: job.experienceLevel,
    location: job.location,
    jobType: job.jobType,
    createdAt: job.createdAt,
  };

  const applicantsWithScore = applications.map((app) => {
    const seekerId = app.seekerId.toString();
    const profile = profileMap.get(seekerId);

    const score = profile
      ? matchScore(
        {
          skills: profile.skills,
          interests: profile.interests,
          experienceLevel: profile.experienceLevel,
          location: profile.location,
        },
        jobInput,
        new Set()
      )
      : 0;

    return { ...app, profile, score };
  });

  // Sort descending by match score
  applicantsWithScore.sort((a, b) => b.score - a.score);

  return { job, applicants: applicantsWithScore };
}

export async function getActiveJobs(filters?: {
  q?: string;
  location?: string;
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  jobType?: string;
  sortBy?: string;
}) {
  await connectDB();

  // Find all active, non-deleted companies
  const activeCompanies = await User.find({
    role: "COMPANY",
    status: "ACTIVE",
    deletedAt: null,
  }).select("_id").lean();
  const activeCompanyIds = activeCompanies.map((c) => c._id);

  const now = new Date();
  const query: Record<string, unknown> = {
    status: "ACTIVE",
    deadline: { $gt: now },
    companyId: { $in: activeCompanyIds },
  };

  if (filters?.q) {
    query.$or = [
      { title: { $regex: filters.q, $options: "i" } },
      { description: { $regex: filters.q, $options: "i" } },
    ];
  }
  if (filters?.location) query.location = { $regex: filters.location, $options: "i" };
  if (filters?.category) query.category = filters.category;
  if (filters?.experienceLevel) query.experienceLevel = filters.experienceLevel;
  if (filters?.jobType) query.jobType = filters.jobType;
  if (filters?.salaryMin) query.salaryMin = { $gte: filters.salaryMin };
  if (filters?.salaryMax) query.salaryMax = { $lte: filters.salaryMax };

  const sortOrder: Record<string, 1 | -1> =
    filters?.sortBy === "deadline"
      ? { deadline: 1 }
      : { createdAt: -1 };

  const jobs = await Job.find(query)
    .sort(sortOrder)
    .limit(100)
    .lean();

  return jobs;
}
