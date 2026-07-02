"use client";

import { useState, useMemo } from "react";
import JobCard from "@/components/jobs/JobCard";
import EmptyState from "@/components/ui/EmptyState";
import { JOB_CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from "@/lib/constants";

interface ScoredJob {
    job: any; // job object
    score?: number;
}

interface CompanyJobsListProps {
    initialJobs: ScoredJob[];
    companyName: string;
    isSeeker: boolean;
}

export default function CompanyJobsList({
    initialJobs,
    companyName,
    isSeeker,
}: CompanyJobsListProps) {
    // Filters state
    const [q, setQ] = useState("");
    const [location, setLocation] = useState("");
    const [category, setCategory] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [jobTypeFilter, setJobTypeFilter] = useState("ALL");
    const [bestMatchesOnly, setBestMatchesOnly] = useState(false);
    const [sortBy, setSortBy] = useState<"latest" | "best_match">(
        isSeeker ? "best_match" : "latest"
    );

    const clearAll = () => {
        setQ("");
        setLocation("");
        setCategory("");
        setExperienceLevel("");
        setJobTypeFilter("ALL");
        setBestMatchesOnly(false);
        setSortBy(isSeeker ? "best_match" : "latest");
    };

    const hasFilters =
        q ||
        location ||
        category ||
        experienceLevel ||
        jobTypeFilter !== "ALL" ||
        bestMatchesOnly ||
        sortBy !== (isSeeker ? "best_match" : "latest");

    // Computed and filtered job list
    const filteredAndSortedJobs = useMemo(() => {
        let result = [...initialJobs];

        // Filter by keyword (title, description, or skills)
        if (q) {
            const keyword = q.toLowerCase();
            result = result.filter(
                (item) =>
                    item.job.title.toLowerCase().includes(keyword) ||
                    item.job.description.toLowerCase().includes(keyword) ||
                    item.job.skillsRequired.some((s: string) => s.toLowerCase().includes(keyword))
            );
        }

        // Filter by location
        if (location) {
            const loc = location.toLowerCase();
            result = result.filter((item) => item.job.location.toLowerCase().includes(loc));
        }

        // Filter by category
        if (category) {
            result = result.filter((item) => item.job.category === category);
        }

        // Filter by experience level
        if (experienceLevel) {
            result = result.filter((item) => item.job.experienceLevel === experienceLevel);
        }

        // Filter by Job Type
        if (jobTypeFilter !== "ALL") {
            result = result.filter((item) => item.job.jobType === jobTypeFilter);
        }

        // Filter by Best Matches Only (score >= 50%)
        if (bestMatchesOnly && isSeeker) {
            result = result.filter((item) => item.score !== undefined && item.score >= 0.5);
        }

        // Sorting
        if (sortBy === "best_match" && isSeeker) {
            result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        } else {
            // sort latest (latest date first)
            result.sort(
                (a, b) =>
                    new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime()
            );
        }

        return result;
    }, [
        initialJobs,
        q,
        location,
        category,
        experienceLevel,
        jobTypeFilter,
        bestMatchesOnly,
        sortBy,
        isSeeker,
    ]);

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Sidebar Filters — sticky below navbar */}
            <aside className="w-full md:w-64 shrink-0 sticky top-20 self-start">
                <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-5 shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-900">Filters</h2>
                        {hasFilters && (
                            <button
                                onClick={clearAll}
                                className="text-xs text-teal-600 hover:underline font-semibold"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Keyword */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Keyword</label>
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Job title, skill…"
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="City, country…"
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                            <option value="">All categories</option>
                            {JOB_CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Experience level */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                            Experience level
                        </label>
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                            <option value="">Any level</option>
                            {EXPERIENCE_LEVELS.map((l) => (
                                <option key={l} value={l}>
                                    {l.charAt(0) + l.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Job Type Option */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Job Type</label>
                        <select
                            value={jobTypeFilter}
                            onChange={(e) => setJobTypeFilter(e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                            <option value="ALL">All types</option>
                            {JOB_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t.charAt(0) + t.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Seeker sorting controls */}
                    {isSeeker && (
                        <div className="pt-3 border-t border-gray-100 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Sort By</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as "latest" | "best_match")}
                                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                >
                                    <option value="best_match">Best Fit Matches</option>
                                    <option value="latest">Latest Jobs</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="bestMatchesOnly"
                                    checked={bestMatchesOnly}
                                    onChange={(e) => setBestMatchesOnly(e.target.checked)}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                                />
                                <label
                                    htmlFor="bestMatchesOnly"
                                    className="text-xs font-semibold text-gray-700 cursor-pointer select-none"
                                >
                                    Best Fits Only (50%+)
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Grid List of Job Cards */}
            <div className="flex-1 min-w-0">
                {/* Section heading sits inside the right column */}
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Open Roles at {companyName}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Apply to the latest job openings posted by {companyName}
                    </p>
                </div>

                {filteredAndSortedJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <EmptyState
                            icon="🔍"
                            heading="No matching jobs found"
                            subtext="Try adjusting the filters in the sidebar panel."
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredAndSortedJobs.map(({ job, score }) => (
                            <div
                                key={job._id.toString()}
                                className="transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                            >
                                <JobCard
                                    job={{
                                        ...job,
                                        _id: job._id.toString(),
                                        deadline: job.deadline,
                                        companyId: job.companyId.toString(),
                                    }}
                                    companyName={companyName}
                                    score={score}
                                    showActions={isSeeker}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
