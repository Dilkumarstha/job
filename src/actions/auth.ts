"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import SeekerProfile from "@/models/SeekerProfile";
import CompanyProfile from "@/models/CompanyProfile";
import { signupSeekerSchema, signupCompanySchema } from "@/lib/validations/auth";

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
