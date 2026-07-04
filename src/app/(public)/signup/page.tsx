"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  signupSeekerSchema,
  signupCompanySchema,
  type SignupSeekerInput,
  type SignupCompanyInput,
} from "@/lib/validations/auth";
import { signupSeeker, signupCompany } from "@/actions/auth";
import { motion, AnimatePresence, StaggerList, StaggerItem } from "@/components/ui/Motion";

type Role = "seeker" | "company";

const roleConfig = {
  seeker: {
    label: "Job Seeker",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    description: "Find your dream job",
  },
  company: {
    label: "Company",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    description: "Register your company",
  },
} as const;

export default function SignupPage() {
  const [role, setRole] = useState<Role>("seeker");

  // ── Each form gets its own independent error + loading state ──────────
  const [seekerError, setSeekerError]     = useState("");
  const [companyError, setCompanyError]   = useState("");
  const [seekerLoading, setSeekerLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);

  const seekerForm = useForm<SignupSeekerInput>({
    resolver: zodResolver(signupSeekerSchema),
  });

  const companyForm = useForm<SignupCompanyInput>({
    resolver: zodResolver(signupCompanySchema),
  });

  const isSeeker = role === "seeker";

  const submitSeeker = async (data: SignupSeekerInput) => {
    setSeekerLoading(true);
    setSeekerError("");
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    const res = await signupSeeker(fd);
    if (res?.error) {
      setSeekerError(res.error);
      setSeekerLoading(false);
    }
    // if no error, server redirects — no need to reset loading
  };

  const submitCompany = async (data: SignupCompanyInput) => {
    setCompanyLoading(true);
    setCompanyError("");
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) fd.append(k, String(v));
    });
    const res = await signupCompany(fd);
    if (res?.error) {
      setCompanyError(res.error);
      setCompanyLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <Link href="/" className="text-xl font-bold text-teal-700">
              HireHub
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Create your account
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-700 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Role selector — switching tabs does NOT clear the other form's error */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
            {(["seeker", "company"] as const).map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    active ? "text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="role-bg"
                      className="absolute inset-0 bg-teal-700 rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {roleConfig[r].icon}
                    {roleConfig[r].label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Forms rendered simultaneously so state is never lost on tab switch */}
          {/* Only the active one is visible; the hidden one keeps its form state */}
          <div>
            {/* ── Seeker form ─────────────────────────────────────────── */}
            <div style={{ display: isSeeker ? "block" : "none" }}>
              <AnimatePresence>
                {seekerError && (
                  <motion.div
                    key="seeker-error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {seekerError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <form onSubmit={seekerForm.handleSubmit(submitSeeker)}>
                <SeekerFields
                  register={seekerForm.register}
                  errors={seekerForm.formState.errors}
                  isLoading={seekerLoading}
                />
              </form>
            </div>

            {/* ── Company form ─────────────────────────────────────────── */}
            <div style={{ display: isSeeker ? "none" : "block" }}>
              <AnimatePresence>
                {companyError && (
                  <motion.div
                    key="company-error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-4"
                  >
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {companyError}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <form onSubmit={companyForm.handleSubmit(submitCompany)}>
                <CompanyFields
                  register={companyForm.register}
                  errors={companyForm.formState.errors}
                  isLoading={companyLoading}
                />
              </form>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          {isSeeker ? "Are you a company? " : "Looking for a job? "}
          <button
            type="button"
            onClick={() => setRole(isSeeker ? "company" : "seeker")}
            className="text-teal-700 font-medium hover:underline"
          >
            {isSeeker ? "Register your company" : "Sign up as Job Seeker"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function SeekerFields({
  register,
  errors,
  isLoading,
}: {
  register: any;
  errors: any;
  isLoading: boolean;
}) {
  return (
    <StaggerList className="space-y-4">
      <StaggerItem>
        <div>
          <label htmlFor="sk-fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input
            id="sk-fullName"
            {...register("fullName")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Jane Doe"
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
        </div>
      </StaggerItem>
      <StaggerItem>
        <div>
          <label htmlFor="sk-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            id="sk-email"
            type="email"
            {...register("email")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="jane@example.com"
          />
          {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
        </div>
      </StaggerItem>
      <StaggerItem>
        <div>
          <label htmlFor="sk-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="sk-password"
            type="password"
            {...register("password")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Min. 8 characters, 1 uppercase, 1 number"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
        </div>
      </StaggerItem>
      <StaggerItem>
        <div>
          <label htmlFor="sk-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password
          </label>
          <input
            id="sk-confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Re-enter your password"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
        </div>
      </StaggerItem>
      <StaggerItem>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 disabled:opacity-60 transition mt-2"
        >
          {isLoading ? "Creating account…" : "Create account"}
        </motion.button>
      </StaggerItem>
    </StaggerList>
  );
}

function CompanyFields({
  register,
  errors,
  isLoading,
}: {
  register: any;
  errors: any;
  isLoading: boolean;
}) {
  return (
    <>
      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
        Your account will be reviewed by a SuperAdmin before you can post jobs.
      </div>
      <StaggerList className="space-y-4">
        <StaggerItem>
          <div>
            <label htmlFor="co-companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company name
            </label>
            <input
              id="co-companyName"
              {...register("companyName")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Acme Corp"
            />
            {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>}
          </div>
        </StaggerItem>
        <StaggerItem>
          <div>
            <label htmlFor="co-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="co-email"
              type="email"
              {...register("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="hr@company.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
        </StaggerItem>
        <StaggerItem>
          <div>
            <label htmlFor="co-industry" className="block text-sm font-medium text-gray-700 mb-1">
              Industry <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="co-industry"
              {...register("industry")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Technology"
            />
          </div>
        </StaggerItem>
        <StaggerItem>
          <div>
            <label htmlFor="co-website" className="block text-sm font-medium text-gray-700 mb-1">
              Website <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="co-website"
              type="url"
              {...register("website")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="https://company.com"
            />
            {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website.message}</p>}
          </div>
        </StaggerItem>
        <StaggerItem>
          <div>
            <label htmlFor="co-password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="co-password"
              type="password"
              {...register("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Min. 8 characters, 1 uppercase, 1 number"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>
        </StaggerItem>
        <StaggerItem>
          <div>
            <label htmlFor="co-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password
            </label>
            <input
              id="co-confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Re-enter your password"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>
        </StaggerItem>
        <StaggerItem>
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 disabled:opacity-60 transition mt-2"
          >
            {isLoading ? "Submitting…" : "Register company"}
          </motion.button>
        </StaggerItem>
      </StaggerList>
    </>
  );
}
