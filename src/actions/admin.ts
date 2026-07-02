"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import SeekerProfile from "@/models/SeekerProfile";
import CompanyProfile from "@/models/CompanyProfile";
import Job from "@/models/Job";
import Application from "@/models/Application";
import AuditLog from "@/models/AuditLog";
import { suspendUserSchema } from "@/lib/validations/admin";
import { createNotification } from "@/lib/notifications";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAdminStats() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    return { error: "Unauthorized" };
  }

  await connectDB();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalSeekers,
    totalCompaniesActive,
    totalCompaniesPending,
    totalJobsActive,
    totalJobsExpired,
    totalApplications,
    recentSignups,
  ] = await Promise.all([
    User.countDocuments({ role: "JOBSEEKER", deletedAt: null }),
    User.countDocuments({ role: "COMPANY", status: "ACTIVE", deletedAt: null }),
    User.countDocuments({ role: "COMPANY", status: "PENDING_APPROVAL", deletedAt: null }),
    Job.countDocuments({ status: "ACTIVE", deadline: { $gt: now } }),
    Job.countDocuments({ $or: [{ status: "EXPIRED" }, { deadline: { $lte: now } }] }),
    Application.countDocuments(),
    User.countDocuments({ createdAt: { $gte: weekAgo }, deletedAt: null }),
  ]);

  return {
    totalSeekers,
    totalCompaniesActive,
    totalCompaniesPending,
    totalJobsActive,
    totalJobsExpired,
    totalApplications,
    recentSignups,
  };
}

export async function listUsers(opts: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const { search, role, status, page = 1, limit = 20 } = opts;
  const filter: Record<string, unknown> = { deletedAt: null };

  if (search) {
    filter.email = { $regex: search, $options: "i" };
  }
  if (role && role !== "ALL") filter.role = role;
  if (status && status !== "ALL") filter.status = status;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return { users, total, page, totalPages: Math.ceil(total / limit) };
}

export async function approveCompany(targetUserId: string) {
  const session = await requireAdmin();
  await connectDB();

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { status: "ACTIVE" },
    { new: true }
  );
  if (!user) return { error: "User not found" };

  await CompanyProfile.findOneAndUpdate(
    { userId: targetUserId },
    { verified: true }
  );

  await AuditLog.create({
    adminId: session.user.id,
    action: "APPROVE_COMPANY",
    targetUserId,
    reason: "Company account approved",
  });

  await createNotification(
    targetUserId,
    "COMPANY_APPROVED",
    "Your company account has been approved. You can now post jobs!"
  );

  revalidatePath("/admin/companies");
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function rejectCompany(targetUserId: string, reason: string) {
  const session = await requireAdmin();
  await connectDB();

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { status: "SUSPENDED", suspendedReason: reason },
    { new: true }
  );
  if (!user) return { error: "User not found" };

  await AuditLog.create({
    adminId: session.user.id,
    action: "REJECT_COMPANY",
    targetUserId,
    reason,
  });

  await createNotification(
    targetUserId,
    "COMPANY_REJECTED",
    `Your company registration was rejected. Reason: ${reason}`
  );

  revalidatePath("/admin/companies");
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function suspendUser(
  targetUserId: string,
  formData: FormData
) {
  const session = await requireAdmin();

  const raw = {
    reason: formData.get("reason"),
    suspendedUntil: formData.get("suspendedUntil") || null,
  };

  const result = suspendUserSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { reason, suspendedUntil } = result.data;

  await connectDB();

  const user = await User.findByIdAndUpdate(
    targetUserId,
    {
      status: "SUSPENDED",
      suspendedReason: reason,
      suspendedUntil: suspendedUntil ?? null,
    },
    { new: true }
  );
  if (!user) return { error: "User not found" };

  await AuditLog.create({
    adminId: session.user.id,
    action: "SUSPEND_USER",
    targetUserId,
    reason,
    metadata: { suspendedUntil },
  });

  await createNotification(
    targetUserId,
    "ACCOUNT_SUSPENDED",
    `Your account has been suspended. Reason: ${reason}${suspendedUntil ? `. Until: ${new Date(suspendedUntil).toLocaleDateString()}` : ""}`
  );

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function reactivateUser(targetUserId: string) {
  const session = await requireAdmin();
  await connectDB();

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { status: "ACTIVE", suspendedUntil: null, suspendedReason: null },
    { new: true }
  );
  if (!user) return { error: "User not found" };

  await AuditLog.create({
    adminId: session.user.id,
    action: "REACTIVATE_USER",
    targetUserId,
    reason: "Manual reactivation by admin",
  });

  await createNotification(
    targetUserId,
    "ACCOUNT_REACTIVATED",
    "Your account has been reactivated. Welcome back!"
  );

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function softDeleteUser(targetUserId: string) {
  const session = await requireAdmin();
  await connectDB();

  const user = await User.findByIdAndUpdate(
    targetUserId,
    { deletedAt: new Date() },
    { new: true }
  );
  if (!user) return { error: "User not found" };

  if (user.role === "COMPANY") {
    // Fetch all jobs belonging to this company to delete their applications
    const companyJobs = await Job.find({ companyId: targetUserId }).select("_id").lean();
    const jobIds = companyJobs.map((j) => j._id);

    // Delete company profile
    await CompanyProfile.deleteOne({ userId: targetUserId });

    // Delete all jobs posted by the company
    await Job.deleteMany({ companyId: targetUserId });

    // Cascade delete applications to those jobs
    if (jobIds.length > 0) {
      await Application.deleteMany({ jobId: { $in: jobIds } });
    }
  }

  await AuditLog.create({
    adminId: session.user.id,
    action: "DELETE_USER",
    targetUserId,
    reason: "Soft deleted by admin",
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function getAuditLogs(page = 1, limit = 30) {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("adminId", "email")
      .populate("targetUserId", "email")
      .lean(),
    AuditLog.countDocuments(),
  ]);

  return { logs, total, page, totalPages: Math.ceil(total / limit) };
}

export async function getPendingCompanies() {
  const session = await auth();
  if (!session || session.user.role !== "SUPERADMIN") {
    return { error: "Unauthorized" };
  }

  await connectDB();

  const users = await User.find({
    role: "COMPANY",
    status: "PENDING_APPROVAL",
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .lean();

  const userIds = users.map((u) => u._id);
  const profiles = await CompanyProfile.find({ userId: { $in: userIds } }).lean();

  const profileMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

  return {
    companies: users.map((u) => ({
      ...u,
      profile: profileMap.get(u._id.toString()) ?? null,
    })),
  };
}

export async function deleteSeeker(targetUserId: string) {
  const session = await requireAdmin();
  await connectDB();

  await Promise.all([
    User.findByIdAndUpdate(targetUserId, { deletedAt: new Date() }),
    SeekerProfile.deleteOne({ userId: targetUserId }),
  ]);

  await AuditLog.create({
    adminId: session.user.id,
    action: "DELETE_USER",
    targetUserId,
    reason: "Hard delete seeker profile, soft delete user",
  });

  revalidatePath("/admin/users");
  return { ok: true };
}
