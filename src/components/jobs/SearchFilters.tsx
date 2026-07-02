"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { motion } from "framer-motion";

export interface FilterValues {
  q?: string;
  location?: string;
  category?: string;
  salaryMin?: string;
  salaryMax?: string;
  experienceLevel?: string;
  jobType?: string;
  sortBy?: "latest" | "deadline";
}

interface SearchFiltersProps {
  categories: string[];
  experienceLevels: string[];
  jobTypes: string[];
  current: FilterValues;
  /**
   * URL-mode (default): each change pushes a new URL via the router.
   * Callback-mode: supply `onChange` and the component calls it instead.
   */
  onChange?: (values: FilterValues) => void;
  /** Hide the category select (e.g. when already scoped to one category) */
  hideCategory?: boolean;
}

export default function SearchFilters({
  categories,
  experienceLevels,
  jobTypes,
  current,
  onChange,
  hideCategory = false,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  // URL-mode helper
  const pushParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(
        Object.entries(current).filter(([, v]) => v) as [string, string][]
      );
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [current, pathname, router]
  );

  // Unified update — uses onChange if provided, otherwise pushes URL
  const update = useCallback(
    (key: keyof FilterValues, value: string) => {
      if (onChange) {
        onChange({ ...current, [key]: value || undefined });
      } else {
        pushParam(key, value);
      }
    },
    [onChange, current, pushParam]
  );

  const clearAll = () => {
    if (onChange) {
      onChange({});
    } else {
      router.push(pathname);
    }
  };

  const hasFilters = Object.values(current).some(Boolean);

  // Shared design standard for form fields to clean up markup repetition
  const baseFieldStyles = "w-full px-3.5 py-2 bg-gray-50/40 text-gray-800 placeholder-gray-400 border border-gray-200/70 rounded-xl text-sm font-medium transition-all duration-200 outline-none focus:bg-white focus:border-emerald-500/40 focus:ring-[3px] focus:ring-emerald-500/5";

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="bg-white rounded-2xl border border-gray-100/70 p-6 space-y-5 sticky top-24 shadow-[0_8px_30px_rgba(0,0,0,0.012)] text-gray-800"
    >
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-sm font-bold text-gray-900 tracking-tight">Filters</h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Sort by */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 tracking-wide mb-1.5">Sort by</label>
        <select
          value={current.sortBy ?? "latest"}
          onChange={(e) => update("sortBy", e.target.value)}
          className={baseFieldStyles}
        >
          <option value="latest">Latest posted</option>
          <option value="deadline">Soonest deadline</option>
        </select>
      </div>

      {/* Keyword */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 tracking-wide mb-1.5">Keyword</label>
        <input
          type="text"
          defaultValue={current.q}
          key={current.q ?? "q"}
          onBlur={(e) => update("q", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
          }}
          placeholder="Job title, skill…"
          className={baseFieldStyles}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 tracking-wide mb-1.5">Location</label>
        <input
          type="text"
          defaultValue={current.location}
          key={current.location ?? "loc"}
          onBlur={(e) => update("location", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("location", (e.target as HTMLInputElement).value);
          }}
          placeholder="City, country…"
          className={baseFieldStyles}
        />
      </div>

      {/* Category */}
      {!hideCategory && (
        <div>
          <label className="block text-xs font-semibold text-gray-400 tracking-wide mb-1.5">Category</label>
          <select
            value={current.category ?? ""}
            onChange={(e) => update("category", e.target.value)}
            className={baseFieldStyles}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Experience level */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 tracking-wide mb-1.5">Experience level</label>
        <select
          value={current.experienceLevel ?? ""}
          onChange={(e) => update("experienceLevel", e.target.value)}
          className={baseFieldStyles}
        >
          <option value="">Any level</option>
          {experienceLevels.map((l) => (
            <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* Job type */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 tracking-wide mb-1.5">Job type</label>
        <select
          value={current.jobType ?? ""}
          onChange={(e) => update("jobType", e.target.value)}
          className={baseFieldStyles}
        >
          <option value="">All types</option>
          {jobTypes.map((t) => (
            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      {/* Salary range */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 tracking-wide mb-1.5">Salary range</label>
        <div className="flex gap-2.5">
          <input
            type="number"
            defaultValue={current.salaryMin}
            key={current.salaryMin ?? "smin"}
            onBlur={(e) => update("salaryMin", e.target.value)}
            placeholder="Min"
            className={`${baseFieldStyles} w-1/2 px-3`}
          />
          <input
            type="number"
            defaultValue={current.salaryMax}
            key={current.salaryMax ?? "smax"}
            onBlur={(e) => update("salaryMax", e.target.value)}
            placeholder="Max"
            className={`${baseFieldStyles} w-1/2 px-3`}
          />
        </div>
      </div>
    </motion.div>
  );
}