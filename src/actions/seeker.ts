"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import SeekerProfile from "@/models/SeekerProfile";
import Application from "@/models/Application";
import SavedJob from "@/models/SavedJob";
import CompanyFollow from "@/models/CompanyFollow";
import Job from "@/models/Job";
import { createNotification } from "@/lib/notifications";
import { onboardingSchema, updateSeekerProfileSchema } from "@/lib/validations/profile";

async function requireSeeker() {
  const session = await auth();
  if (!session || session.user.role !== "JOBSEEKER") throw new Error("Unauthorized");
  return session;
}

export async function completeOnboarding(formData: FormData) {
  const session = await requireSeeker();

  const interests = formData.getAll("interests") as string[];
  const skills = formData.getAll("skills") as string[];
  const raw = {
    interests,
    skills,
    experienceLevel: formData.get("experienceLevel"),
    location: formData.get("location"),
  };

  const result = onboardingSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await connectDB();

  await SeekerProfile.findOneAndUpdate(
    { userId: session.user.id },
    {
      interests: result.data.interests,
      skills: result.data.skills,
      experienceLevel: result.data.experienceLevel,
      location: result.data.location,
    },
    { upsert: true }
  );

  redirect("/seeker/feed");
}

export async function updateSeekerProfile(formData: FormData) {
  const session = await requireSeeker();

  const skills = formData.getAll("skills") as string[];
  const interests = formData.getAll("interests") as string[];

  const raw = {
    fullName: formData.get("fullName"),
    bio: formData.get("bio") || undefined,
    experienceLevel: formData.get("experienceLevel") || undefined,
    location: formData.get("location") || undefined,
    skills: skills.length > 0 ? skills : undefined,
    interests: interests.length > 0 ? interests : undefined,
  };

  const result = updateSeekerProfileSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await connectDB();

  await SeekerProfile.findOneAndUpdate(
    { userId: session.user.id },
    result.data,
    { upsert: true }
  );

  revalidatePath("/seeker/profile");
  return { ok: true };
}

export async function applyToJob(
  jobId: string,
  data: { coverLetter: string; phone: string; resumeUrl: string }
) {
  const session = await requireSeeker();
  await connectDB();

  try {
    await Application.create({
      jobId,
      seekerId: session.user.id,
      status: "PENDING",
      coverLetter: data.coverLetter,
      phone: data.phone,
      resumeUrl: data.resumeUrl,
    });

    // Look up job + seeker name to send a rich notification to the company
    const [job, seekerProfile] = await Promise.all([
      Job.findById(jobId).select("title companyId").lean(),
      SeekerProfile.findOne({ userId: session.user.id }).select("fullName").lean(),
    ]);

    if (job) {
      const seekerName = seekerProfile?.fullName ?? session.user.email;
      await createNotification(
        job.companyId.toString(),
        "NEW_APPLICANT",
        `${seekerName} applied for your job "${job.title}"`,
        {
          jobId: jobId,
          jobTitle: job.title,
          seekerId: session.user.id,
          seekerName,
        }
      );
    }

    revalidatePath("/seeker/applications");
    return { ok: true };
  } catch (err: unknown) {
    const mongoErr = err as { code?: number };
    if (mongoErr.code === 11000) {
      return { error: "You have already applied to this job." };
    }
    return { error: "Failed to submit application." };
  }
}

export async function toggleSaveJob(jobId: string) {
  const session = await requireSeeker();
  await connectDB();

  const existing = await SavedJob.findOne({ seekerId: session.user.id, jobId });
  if (existing) {
    await SavedJob.deleteOne({ _id: existing._id });
    revalidatePath("/seeker/saved");
    revalidatePath("/seeker/feed");
    return { saved: false };
  } else {
    await SavedJob.create({ seekerId: session.user.id, jobId });
    revalidatePath("/seeker/saved");
    revalidatePath("/seeker/feed");
    return { saved: true };
  }
}

export async function toggleFollowCompany(companyId: string) {
  const session = await requireSeeker();
  await connectDB();

  const existing = await CompanyFollow.findOne({
    seekerId: session.user.id,
    companyId,
  });

  if (existing) {
    await CompanyFollow.deleteOne({ _id: existing._id });
    return { following: false };
  } else {
    await CompanyFollow.create({ seekerId: session.user.id, companyId });
    return { following: true };
  }
}

export async function getSeekerData(userId: string) {
  await connectDB();

  const [profile, savedJobs, follows] = await Promise.all([
    SeekerProfile.findOne({ userId }).lean(),
    SavedJob.find({ seekerId: userId }).lean(),
    CompanyFollow.find({ seekerId: userId }).lean(),
  ]);

  return { profile, savedJobs, follows };
}
