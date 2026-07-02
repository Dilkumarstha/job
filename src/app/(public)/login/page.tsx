"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { motion, AnimatePresence } from "@/components/ui/Motion";
import { FadeIn, FadeUp } from "@/components/ui/Motion";

function LoginForm() {
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const message = searchParams.get("message");
  const error = searchParams.get("error");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setServerError("");

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setServerError("Invalid email or password.");
      setIsLoading(false);
      return;
    }

    // Fetch session to determine role for redirect
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    const role = session?.user?.role;

    // Use location.href for a full page load so the layout (NavbarServer)
    // re-renders on the server with the fresh session cookie.
    const target =
      role === "SUPERADMIN" ? "/admin/dashboard" :
      role === "COMPANY" ? "/company/dashboard" :
      role === "JOBSEEKER" ? "/seeker/feed" :
      "/";
    window.location.href = target;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      {/* Card: slide up on mount */}
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mb-8">
          {/* Logo */}
          <FadeIn delay={0}>
            <Link href="/" className="text-xl font-bold text-indigo-700">
              HireHub
            </Link>
          </FadeIn>

          {/* Heading */}
          <FadeUp delay={0.05}>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Sign in to your account
            </h1>
          </FadeUp>
        </div>

        {/* Status message banners — animated in/out */}
        <AnimatePresence>
          {message === "account-created" && (
            <motion.div
              key="account-created"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Account created! Please sign in.
              </div>
            </motion.div>
          )}
          {message === "pending-approval" && (
            <motion.div
              key="pending-approval"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                Your company account is pending SuperAdmin approval. You&apos;ll be
                notified once approved.
              </div>
            </motion.div>
          )}
          {error === "unauthorized" && (
            <motion.div
              key="unauthorized"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                You don&apos;t have permission to access that page.
              </div>
            </motion.div>
          )}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit button with tap scale */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 bg-indigo-700 text-white text-sm font-semibold rounded-lg hover:bg-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-indigo-700 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
          Loading login form...
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
