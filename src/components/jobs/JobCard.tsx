"use client";

import Link from "next/link";
import { useState } from "react";
import { toggleSaveJob } from "@/actions/seeker";
import { motion } from "framer-motion";

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    category: string;
    location: string;
    jobType: string;
    salaryMin?: number;
    salaryMax?: number;
    experienceLevel: string;
    deadline: string | Date;
    companyId: string;
    skillsRequired: string[];
  };
  companyName?: string;
  score?: number;
  isSaved?: boolean;
  isApplied?: boolean;
  showActions?: boolean;
}

const JOB_TYPE_STYLE: Record<string, { label: string; cls: string }> = {
  REMOTE: { label: "Remote",  cls: "bg-emerald-50 text-emerald-600 border-emerald-100/50" },
  ONSITE: { label: "On-site", cls: "bg-blue-50 text-blue-600 border-blue-100/40" },
  HYBRID: { label: "Hybrid",  cls: "bg-purple-50 text-purple-600 border-purple-100/40" },
};

// SVG Icons to match image_7cacbb.jpg perfectly
const MapPinIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function JobCard({
  job,
  companyName = "Company",
  score,
  isSaved: initialSaved = false,
  showActions = true,
}: JobCardProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await toggleSaveJob(job._id);
    setSaved(res.saved ?? false);
    setSaving(false);
  };

  const typeStyle = JOB_TYPE_STYLE[job.jobType] ?? { label: job.jobType, cls: "bg-gray-50 text-gray-500 border-gray-100" };
  const isExpired = new Date(job.deadline) < new Date();

  const salaryText =
    job.salaryMin && job.salaryMax
      ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`
      : job.salaryMin ? `$${(job.salaryMin / 1000).toFixed(0)}k+` : null;

  const daysLeft = isExpired ? 0 : Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86_400_000);

  const deadlineText = isExpired
    ? "Expired"
    : daysLeft <= 3
      ? `${daysLeft}d left`
      : new Date(job.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-100/70 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.012)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.025)] hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between h-full group relative"
    >
      <div>
        {/* ── Top Row: Company Info & Match Percentage Badge ──────────────── */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Generic Soft Logo Avatar */}
            <div className="w-12 h-12 rounded-xl bg-emerald-50/50 border border-emerald-100/30 flex items-center justify-center font-bold text-emerald-600 shrink-0 text-base">
              {companyName ? companyName.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="min-w-0">
              <Link href={`/jobs/${job._id}`} className="text-base font-bold text-gray-900 leading-snug truncate block group-hover:text-emerald-600 transition-colors">
                {job.title}
              </Link>
              {companyName && (
                <Link href={`/companies/${job.companyId}`} className="text-xs font-semibold text-gray-400 truncate block mt-0.5 hover:underline">
                  {companyName}
                </Link>
              )}
            </div>
          </div>

          {/* Match Score Pill Badge */}
          {score !== undefined && (
            <span className="shrink-0 inline-flex items-center justify-center bg-emerald-50 text-emerald-600 font-bold text-xs px-2.5 py-1 rounded-lg border border-emerald-100/40">
              {Math.round(score * 100)}%
            </span>
          )}
        </div>

        {/* ── Middle Row: Soft Metadata Badges/Pills ──────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${typeStyle.cls}`}>
            {typeStyle.label}
          </span>
          <span className="bg-gray-50 text-gray-500 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-gray-100 flex items-center">
            <MapPinIcon />
            {job.location}
          </span>
          <span className="bg-gray-50/80 text-gray-500 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-gray-100">
            {job.experienceLevel}
          </span>
          {salaryText && (
            <span className="bg-amber-50/60 text-amber-600 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-100/20">
              {salaryText}
            </span>
          )}
        </div>

        {/* ── Skills Tags Row ─────────────────────────────────────────────── */}
        {job.skillsRequired.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {job.skillsRequired.slice(0, 3).map((s) => (
              <span key={s} className="bg-gray-100/60 text-gray-500 text-[10px] font-medium px-2.5 py-1 rounded-md">
                {s}
              </span>
            ))}
            {job.skillsRequired.length > 3 && (
              <span className="bg-gray-50 text-gray-400 text-[10px] font-medium px-2 py-1 rounded-md">
                +{job.skillsRequired.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Row: Meta Info & Actions Alignment ───────────────────── */}
      <div className="pt-4 border-t border-gray-100/60 flex items-center justify-between gap-3 mt-auto">
        <div className="flex flex-col">
          <span className={`text-[11px] font-medium flex items-center ${isExpired || daysLeft <= 3 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
            <CalendarIcon />
            {deadlineText}
          </span>
          {job.category && (
            <span className="text-[10px] font-semibold text-gray-400 mt-0.5">
              {job.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isExpired ? (
            <>
              <Link
                href={`/jobs/${job._id}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors whitespace-nowrap"
              >
                Apply Now
              </Link>
              {showActions && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`p-2.5 rounded-xl border transition-all ${
                    saved
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-white border-gray-200/70 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                  title={saved ? "Remove from saved" : "Save job"}
                >
                  <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 3v19.5l-5.25-3-5.25 3V3m10.5 0a1.5 1.5 0 0 0-1.5-1.5h-7.5A1.5 1.5 0 0 0 4.5 3v15" />
                  </svg>
                </button>
              )}
            </>
          ) : (
            <span className="text-xs text-red-400 font-medium bg-red-50/50 px-3 py-1.5 rounded-lg border border-red-100/30">
              Closed
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}