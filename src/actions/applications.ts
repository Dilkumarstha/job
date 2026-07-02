"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Application from "@/models/Application";
import Job from "@/models/Job";
import { reviewApplicationSchema } from "@/lib/validations/application";
import { createNotification } from "@/lib/notifications";

export async function reviewApplicant(applicationId: string, formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "COMPANY") {
    return { error: "Unauthorized" };
  }

  const raw = {
    status: formData.get("status"),
    message: formData.get("message"),
  };

  const result = reviewApplicationSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await connectDB();

  const application = await Application.findById(applicationId).populate("jobId").lean();
  if (!application) return { error: "Application not found" };

  const job = application.jobId as unknown as { companyId: string; title: string };
  if (job.companyId.toString() !== session.user.id) {
    return { error: "Access denied" };
  }

  await Application.findByIdAndUpdate(applicationId, {
    status: result.data.status,
    message: result.data.message,
  });

  const statusLabel =
    result.data.status === "APPROVED"
      ? "approved ✅"
      : result.data.status === "REJECTED"
      ? "rejected ❌"
      : "reviewed";

  await createNotification(
    (application.seekerId as unknown as string).toString(),
    "APPLICATION_STATUS_CHANGED",
    `Your application for "${job.title}" has been ${statusLabel}. Message: ${result.data.message}`
  );

  revalidatePath(`/company/jobs/${job.companyId}/applicants`);
  return { ok: true };
}

export async function getSeekerApplications(seekerId: string) {
  await connectDB();

  const applications = await Application.find({ seekerId })
    .populate({
      path: "jobId",
      select: "title location jobType companyId",
      populate: { path: "companyId", select: "email", model: "User" },
    })
    .sort({ appliedAt: -1 })
    .lean();

  return applications;
}

export async function checkApplied(jobId: string, seekerId: string) {
  await connectDB();
  const existing = await Application.findOne({ jobId, seekerId });
  return !!existing;
}
