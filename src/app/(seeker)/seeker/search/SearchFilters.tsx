"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

interface SearchFiltersProps {
  categories: string[];
  experienceLevels: string[];
  jobTypes: string[];
  current: {
    q?: string;
    location?: string;
    category?: string;
    salaryMin?: string;
    salaryMax?: string;
    experienceLevel?: string;
  };
}

export default function SearchFilters({
  categories,
  experienceLevels,
  current,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const updateParam = useCallback(
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

  const clearAll = () => router.push(pathname);

  const hasFilters = Object.values(current).some(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs text-indigo-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Keyword */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Keyword
        </label>
        <input
          type="text"
          defaultValue={current.q}
          onBlur={(e) => updateParam("q", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateParam("q", (e.target as HTMLInputElement).value);
          }}
          placeholder="Job title, skill…"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Location
        </label>
        <input
          type="text"
          defaultValue={current.location}
          onBlur={(e) => updateParam("location", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              updateParam("location", (e.target as HTMLInputElement).value);
          }}
          placeholder="City, country…"
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Category
        </label>
        <select
          value={current.category ?? ""}
          onChange={(e) => updateParam("category", e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Experience level */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Experience level
        </label>
        <select
          value={current.experienceLevel ?? ""}
          onChange={(e) => updateParam("experienceLevel", e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Any level</option>
          {experienceLevels.map((l) => (
            <option key={l} value={l}>
              {l.charAt(0) + l.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Salary range */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Salary range
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            defaultValue={current.salaryMin}
            onBlur={(e) => updateParam("salaryMin", e.target.value)}
            placeholder="Min"
            className="w-1/2 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            defaultValue={current.salaryMax}
            onBlur={(e) => updateParam("salaryMax", e.target.value)}
            placeholder="Max"
            className="w-1/2 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
