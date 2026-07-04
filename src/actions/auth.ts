"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import SeekerProfile from "@/models/SeekerProfile";
import CompanyProfile from "@/models/CompanyProfile";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  signupSeekerSchema,
  signupCompanySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validations/auth";

const BCRYPT_ROUNDS = 12;

export async function signupSeeker(formData: FormData) {
  const raw = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = signupSeekerSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { fullName, email, password } = result.data;

  await connectDB();

  // Check for existing user
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: "JOBSEEKER",
    status: "ACTIVE",
  });

  await SeekerProfile.create({
    userId: user._id,
    fullName,
    skills: [],
    interests: [],
  });

  redirect("/login?message=account-created");
}

export async function signupCompany(formData: FormData) {
  const raw = {
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    industry: formData.get("industry") || undefined,
    website: formData.get("website") || undefined,
  };

  const result = signupCompanySchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { companyName, email, password, industry, website } = result.data;

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    role: "COMPANY",
    status: "PENDING_APPROVAL",
  });

  await CompanyProfile.create({
    userId: user._id,
    companyName,
    industry: industry || "",
    website: website || "",
    verified: false,
  });

  redirect("/login?message=pending-approval");
}

export async function requestPasswordReset(formData: FormData) {
  const raw = {
    email: formData.get("email"),
  };

  const result = forgotPasswordSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email } = result.data;

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase(), deletedAt: null });
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, resetLink);

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string | null;
  if (!token) {
    return { error: "Invalid reset link." };
  }

  const raw = {
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = resetPasswordSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { password } = result.data;

  await connectDB();

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
    deletedAt: null,
  });

  if (!user) {
    return { error: "Invalid or expired reset link." };
  }

  user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  redirect("/login?message=password-reset");
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const result = changePasswordSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  await connectDB();

  const user = await User.findById(session.user.id);
  if (!user) return { error: "User not found" };

  const isValid = await bcrypt.compare(result.data.currentPassword, user.passwordHash);
  if (!isValid) return { error: "Current password is incorrect" };

  if (result.data.currentPassword === result.data.newPassword) {
    return { error: "New password must be different from current password" };
  }

  user.passwordHash = await bcrypt.hash(result.data.newPassword, BCRYPT_ROUNDS);
  await user.save();

  return { success: true };
}
