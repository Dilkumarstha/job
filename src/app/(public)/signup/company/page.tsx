"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { signupCompanySchema, type SignupCompanyInput } from "@/lib/validations/auth";
import { signupCompany } from "@/actions/auth";
import { motion, AnimatePresence, StaggerList, StaggerItem } from "@/components/ui/Motion";

export default function CompanySignupPage() {
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupCompanyInput>({
    resolver: zodResolver(signupCompanySchema),
  });

  const onSubmit = async (data: SignupCompanyInput) => {
    setIsLoading(true);
    setServerError("");
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) fd.append(k, String(v));
    });
    const result = await signupCompany(fd);
    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-8">
          <Link href="/" className="text-xl font-bold text-indigo-700">
            HireHub
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Register your company
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Your account will be reviewed by a SuperAdmin before you can post
            jobs.
          </p>
        </div>

        <AnimatePresence>
          {serverError && (
            <motion.div
              key="server-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {serverError}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <StaggerList>
            <StaggerItem>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
                <input id="companyName" {...register("companyName")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Acme Corp" />
                {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName.message}</p>}
              </div>
            </StaggerItem>
            <StaggerItem>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input id="email" type="email" {...register("email")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="hr@company.com" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </StaggerItem>
            <StaggerItem>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry <span className="text-gray-400">(optional)</span></label>
                <input id="industry" {...register("industry")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Technology" />
              </div>
            </StaggerItem>
            <StaggerItem>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website <span className="text-gray-400">(optional)</span></label>
                <input id="website" type="url" {...register("website")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://company.com" />
                {errors.website && <p className="mt-1 text-xs text-red-600">{errors.website.message}</p>}
              </div>
            </StaggerItem>
            <StaggerItem>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input id="password" type="password" {...register("password")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Min. 8 characters, 1 uppercase, 1 number" />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>
            </StaggerItem>
            <StaggerItem>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input id="confirmPassword" type="password" {...register("confirmPassword")} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Re-enter your password" />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>
            </StaggerItem>
            <StaggerItem>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileTap={{ scale: 0.97 }}
                className="w-full py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 disabled:opacity-60 transition mt-2"
              >
                {isLoading ? "Submitting…" : "Register company"}
              </motion.button>
            </StaggerItem>
          </StaggerList>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Looking for a job?{" "}
          <Link href="/signup/seeker" className="text-indigo-700 font-medium hover:underline">Sign up as Job Seeker</Link>
        </p>
      </motion.div>
    </div>
  );
}
