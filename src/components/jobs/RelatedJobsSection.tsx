"use client";

import { useState, useMemo } from "react";
import JobCard from "./JobCard";
import SearchFilters, { FilterValues } from "./SearchFilters";
import EmptyState from "@/components/ui/EmptyState";
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from "@/lib/constants";
import { motion, AnimatePresence, StaggerList, StaggerItem } from "@/components/ui/Motion";

interface RelatedJob {
  _id: string;
  title: string;
  category: string;
  location: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel: string;
  deadline: string;
  companyId: string;
  skillsRequired: string[];
  companyName?: string;
}

interface RelatedJobsSectionProps {
  sameCompanyJobs: RelatedJob[];
  similarJobs: RelatedJob[];
  currentJobId: string;
}

type TabType = "similar" | "company";

export default function RelatedJobsSection({
  sameCompanyJobs,
  similarJobs,
  currentJobId,
}: RelatedJobsSectionProps) {
  const [tab, setTab] = useState<TabType>("similar");
  const [filters, setFilters] = useState<FilterValues>({});

  // Reset filters when switching tabs
  const handleTabChange = (newTab: TabType) => {
    setTab(newTab);
    setFilters({});
  };

  const baseJobs = tab === "similar" ? similarJobs : sameCompanyJobs;

  const filtered = useMemo(() => {
    const { q, location, category, experienceLevel, jobType, salaryMin, salaryMax, sortBy } = filters;

    const result = baseJobs.filter((job) => {
      if (job._id === currentJobId) return false;

      if (q) {
        const kw = q.toLowerCase();
        if (
          !job.title.toLowerCase().includes(kw) &&
          !job.skillsRequired.some((s) => s.toLowerCase().includes(kw))
        )
          return false;
      }
      if (location && !job.location.toLowerCase().includes(location.toLowerCase()))
        return false;
      if (category && job.category !== category) return false;
      if (experienceLevel && job.experienceLevel !== experienceLevel) return false;
      if (jobType && job.jobType !== jobType) return false;
      if (salaryMin && job.salaryMin !== undefined && job.salaryMin < Number(salaryMin))
        return false;
      if (salaryMax && job.salaryMax !== undefined && job.salaryMax > Number(salaryMax))
        return false;

      return true;
    });

    // Sort
    if (sortBy === "deadline") {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    // default "latest" — baseJobs already arrive sorted by createdAt desc from server

    return result;
  }, [baseJobs, currentJobId, filters]);

  const hasFilters = Object.values(filters).some(Boolean);

  if (sameCompanyJobs.length === 0 && similarJobs.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-100 pt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">More Jobs</h2>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => handleTabChange("similar")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              tab === "similar"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Similar Jobs
            {similarJobs.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                {similarJobs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("company")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
              tab === "company"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            From Same Company
            {sameCompanyJobs.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full">
                {sameCompanyJobs.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Shared filter sidebar — callback-mode, category hidden on company tab */}
        <aside className="w-56 shrink-0 hidden lg:block">
          <SearchFilters
            categories={[...JOB_CATEGORIES]}
            experienceLevels={[...EXPERIENCE_LEVELS]}
            jobTypes={[...JOB_TYPES]}
            current={filters}
            onChange={setFilters}
            hideCategory={tab === "company"}
          />
        </aside>

        {/* Job cards grid */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {filtered.length === 0 ? (
                <EmptyState
                  icon={hasFilters ? "🔍" : tab === "similar" ? "💼" : "🏢"}
                  heading={
                    hasFilters
                      ? "No jobs match your filters"
                      : tab === "similar"
                      ? "No similar jobs right now"
                      : "No other jobs from this company"
                  }
                  subtext={
                    hasFilters
                      ? "Try clearing some filters."
                      : "Check back later for new postings."
                  }
                />
              ) : (
                <StaggerList className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filtered.map((job) => (
                    <StaggerItem key={job._id}>
                      <JobCard job={job} companyName={job.companyName} showActions />
                    </StaggerItem>
                  ))}
                </StaggerList>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
