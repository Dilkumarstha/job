"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface TopSearchBarProps {
  defaultQ?: string;
  defaultLocation?: string;
  targetPath?: string;
  showShortcuts?: boolean;
}

const SHORTCUTS = [
  { label: "Engineering", q: "Engineering" },
  { label: "Design", q: "Design" },
  { label: "Product", q: "Product" },
  { label: "Data", q: "Data & Analytics" },
  { label: "Marketing", q: "Marketing" },
  { label: "Remote", q: "Remote" },
];

export default function TopSearchBar({
  defaultQ = "",
  defaultLocation = "",
  targetPath = "/seeker/search",
  showShortcuts = true,
}: TopSearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ);
  const [location, setLocation] = useState(defaultLocation);
  const [focused, setFocused] = useState(false);

  const go = (query: string, loc = location) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (loc.trim()) params.set("location", loc.trim());
    const queryStr = params.toString();
    router.push(`${targetPath}${queryStr ? `?${queryStr}` : ""}`);
  };

  return (
    <div className="w-full max-w-3xl flex flex-col gap-4">
      {/* ── Search Pill Wrapper with Ultra Soft Shadow & Subtle Gray Border ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`
          flex items-center bg-white rounded-full
          px-2.5 py-2 gap-0 border transition-all duration-300
          ${
            focused
              ? "border-emerald-500/40 shadow-[0_12px_32px_rgba(5,150,105,0.06),_0_0_0_4px_rgba(5,150,105,0.05)]"
              : "border-gray-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.015)] hover:border-gray-300/80 hover:shadow-[0_12px_32px_rgba(0,0,0,0.025)]"
          }
        `}
      >
        {/* Keyword field */}
        <div className="flex items-center gap-3 flex-1 px-4 py-0.5">
          <svg
            className="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go(q)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Job title, skill, or company"
            className="w-full text-sm text-gray-800 placeholder-gray-400 font-medium bg-transparent outline-none leading-none"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-all"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Muted Premium Vertical Divider */}
        <div className="w-px h-6 bg-gray-200/80 shrink-0" />

        {/* Location field */}
        <div className="flex items-center gap-3 flex-[0.7] px-4 py-0.5">
          <svg
            className="w-4 h-4 text-gray-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21s-6-5.686-6-10a6 6 0 0 1 12 0c0 4.314-6 10-6 10z"
            />
            <circle cx="12" cy="11" r="2" />
          </svg>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go(q)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Location"
            className="w-full text-sm text-gray-800 placeholder-gray-400 font-medium bg-transparent outline-none leading-none"
          />
        </div>

        {/* Search button matching image_7cacbb.jpg exactly */}
        <motion.button
          onClick={() => go(q)}
          whileTap={{ scale: 0.97 }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shrink-0 rounded-full px-7 py-2.5 shadow-sm transition-all duration-200"
        >
          Search
        </motion.button>
      </motion.div>

      {/* ── Soft Category Filter Pills ───────────────────────────────────── */}
      {showShortcuts && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex flex-wrap gap-2.5 justify-center mt-1"
        >
          {SHORTCUTS.map(({ label, q: sq }) => (
            <button
              key={sq}
              onClick={() => go(sq)}
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-white border border-gray-200/60 text-gray-500 hover:border-emerald-500/50 hover:text-emerald-700 hover:bg-emerald-50/40 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.015)]"
            >
              {label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
