"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

interface ProfileShellProps {
  initials: string;
  fullName: string;
  location?: string;
  experienceLevel?: string;
  resumeUrl?: string;
  profileCompleteness: number;
  totalApplications: number;
  savedCount: number;
  approvedCount: number;
  skills: string[];
  interests: string[];
  children: ReactNode; // the form
}

// Reusable animated sidebar card
function SidebarCard({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay }}
      className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Animated counter number
function AnimatedCount({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.35 }}
      className="text-lg font-bold text-gray-900"
    >
      {value}
    </motion.span>
  );
}

export default function ProfileShell({
  initials,
  fullName,
  location,
  experienceLevel,
  resumeUrl,
  profileCompleteness,
  totalApplications,
  savedCount,
  approvedCount,
  skills,
  interests,
  children,
}: ProfileShellProps) {
  const strengthColor =
    profileCompleteness >= 80
      ? "bg-green-500"
      : profileCompleteness >= 50
      ? "bg-amber-500"
      : "bg-red-400";

  const strengthText =
    profileCompleteness >= 80
      ? "text-green-600"
      : profileCompleteness >= 50
      ? "text-amber-600"
      : "text-red-500";

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Banner + Avatar ── */}
      <div className="relative mb-6">
        <motion.div
          initial={{ opacity: 0, scaleX: 0.85 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="h-36 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-teal-700 shadow-lg origin-left"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.2 }}
          className="absolute -bottom-10 left-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-teal-700 select-none">
            {initials}
          </div>
        </motion.div>
      </div>

      {/* ── Name + Meta Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.25 }}
        className="pt-12 px-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            {fullName || "Complete your profile"}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
            {location && (
              <span className="flex items-center gap-1">📍 {location}</span>
            )}
            {experienceLevel && (
              <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                {experienceLevel.charAt(0) + experienceLevel.slice(1).toLowerCase()}
              </span>
            )}
          </div>
        </div>
        {resumeUrl && (
          <motion.a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            📄 View Resume
          </motion.a>
        )}
      </motion.div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sidebar */}
        <aside className="space-y-4">

          {/* Stats */}
          <SidebarCard delay={0.3}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Stats</h2>
            <div className="space-y-3">
              <Link href="/seeker/applications" className="flex items-center justify-between group">
                <span className="text-sm text-gray-600 group-hover:text-teal-700 transition">Applications</span>
                <AnimatedCount value={totalApplications} />
              </Link>
              <div className="h-px bg-gray-50" />
              <Link href="/seeker/saved" className="flex items-center justify-between group">
                <span className="text-sm text-gray-600 group-hover:text-teal-700 transition">Saved Jobs</span>
                <AnimatedCount value={savedCount} />
              </Link>
              <div className="h-px bg-gray-50" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approved</span>
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.45 }}
                  className="text-lg font-bold text-green-600"
                >
                  {approvedCount}
                </motion.span>
              </div>
            </div>
          </SidebarCard>

          {/* Profile strength */}
          <SidebarCard delay={0.38}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Profile Strength</h2>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={`text-sm font-bold ${strengthText}`}
              >
                {profileCompleteness}%
              </motion.span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileCompleteness}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
                className={`h-full rounded-full ${strengthColor}`}
              />
            </div>
            {profileCompleteness < 100 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xs text-gray-400 mt-2"
              >
                {profileCompleteness < 50
                  ? "Fill in more details to stand out to employers."
                  : "Almost there — add the remaining details!"}
              </motion.p>
            )}
          </SidebarCard>

          {/* Skills snapshot */}
          {skills.length > 0 && (
            <SidebarCard delay={0.45}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Skills</h2>
              <motion.div
                className="flex flex-wrap gap-1.5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.5 } },
                }}
              >
                {skills.slice(0, 10).map((s) => (
                  <motion.span
                    key={s}
                    variants={{
                      hidden: { opacity: 0, scale: 0.7 },
                      visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
                    }}
                    className="px-2.5 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100"
                  >
                    {s}
                  </motion.span>
                ))}
                {skills.length > 10 && (
                  <span className="px-2.5 py-1 text-gray-400 text-xs">
                    +{skills.length - 10} more
                  </span>
                )}
              </motion.div>
            </SidebarCard>
          )}

          {/* Interests snapshot */}
          {interests.length > 0 && (
            <SidebarCard delay={0.52}>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Interests</h2>
              <motion.div
                className="flex flex-wrap gap-1.5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.55 } },
                }}
              >
                {interests.map((i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, scale: 0.7 },
                      visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
                    }}
                    className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs rounded-full border border-violet-100"
                  >
                    {i}
                  </motion.span>
                ))}
              </motion.div>
            </SidebarCard>
          )}
        </aside>

        {/* Main form — slides in from right */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="lg:col-span-2"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
