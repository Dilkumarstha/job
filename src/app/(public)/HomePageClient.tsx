"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  AnimatedSection,
  AnimatedGrid,
  AnimatedGridItem,
} from "@/components/ui/AnimatedSection";
import JobCard from "@/components/jobs/JobCard";
import EmptyState from "@/components/ui/EmptyState";
import TopSearchBar from "@/components/jobs/TopSearchBar";

interface ScoredJob {
  job: any;
  score?: number;
}

interface HiringCompany {
  id: string;
  companyName: string;
  logoUrl: string;
  industry: string;
  jobCount: number;
}

interface HomePageClientProps {
  isSeeker: boolean;
  scoredJobs: ScoredJob[];
  hiringCompanies: HiringCompany[];
  jobsCount: number;
  companyNameMap: Record<string, string>;
  savedJobIds: string[];
  session: any;
}

export default function HomePageClient({
  isSeeker,
  scoredJobs,
  hiringCompanies,
  jobsCount,
  companyNameMap,
  savedJobIds,
  session,
}: HomePageClientProps) {
  const savedJobIdSet = new Set(savedJobIds);

  if (isSeeker) {
    return (
      <div className="min-h-screen bg-[--color-bg]">
        <main className="page-container py-12 space-y-12">
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <p className="section-label">Job Feed</p>
            <h1 className="text-4xl font-extrabold text-[--color-fg] tracking-tight leading-tight">
              Find your next role
            </h1>
            <p className="text-base text-[--color-muted] max-w-md leading-relaxed">
              Personalised listings ranked by match accuracy — the best fits
              appear first.
            </p>
            <div className="w-full flex justify-center mt-2">
              <TopSearchBar />
            </div>
          </motion.section>

          <AnimatedGrid className="grid grid-cols-3 gap-4" delay={0.08}>
            {[
              { value: scoredJobs.length, label: "Matched jobs" },
              { value: hiringCompanies.length, label: "Companies hiring" },
              {
                value: scoredJobs.filter(({ score }) => (score ?? 0) >= 0.7)
                  .length,
                label: "Strong matches (70%+)",
              },
            ].map(({ value, label }, i) => (
              <AnimatedGridItem key={label} index={i} className="stat-card">
                <span className="text-3xl font-extrabold text-teal-600 leading-none">
                  {value}
                </span>
                <span className="text-xs text-[--color-muted] mt-1">
                  {label}
                </span>
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>

          {hiringCompanies.length > 0 && (
            <AnimatedSection delay={0.14}>
              <div className="flex items-center justify-between mb-4">
                <p className="section-label">Actively Hiring</p>
                <span className="text-xs text-[--color-subtle]">
                  {hiringCompanies.length} companies
                </span>
              </div>
              <div className="scroll-x">
                {hiringCompanies.map((company, i) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.18 + i * 0.05 }}
                  >
                    <Link
                      href={`/companies/${company.id}`}
                      className="card card-hover shrink-0 flex items-center gap-3 px-5 py-4 min-w-[200px] max-w-[220px] group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-sm font-bold text-teal-600 shrink-0">
                        {company.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={company.logoUrl}
                            alt={company.companyName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          company.companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[--color-fg] group-hover:text-teal-600 transition-colors truncate leading-tight">
                          {company.companyName}
                        </p>
                        {company.industry && (
                          <p className="text-[0.7rem] text-[--color-subtle] truncate mt-0.5">
                            {company.industry}
                          </p>
                        )}
                        <p className="text-[0.7rem] font-semibold text-teal-600 mt-1">
                          {company.jobCount} open{" "}
                          {company.jobCount === 1 ? "role" : "roles"}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          )}

          <AnimatedSection delay={0.2}>
            <div className="flex items-end justify-between pb-5 border-b border-[--color-border] mb-8">
              <div>
                <p className="section-label mb-1">Recommended</p>
                <h2 className="text-xl font-bold text-[--color-fg] leading-tight">
                  Your Matches
                </h2>
              </div>
              <span className="text-sm text-[--color-subtle]">
                {scoredJobs.length} {scoredJobs.length === 1 ? "job" : "jobs"}
              </span>
            </div>
            {scoredJobs.length === 0 ? (
              <EmptyState
                heading="No matching jobs yet"
                subtext="Complete your profile to improve your matches, or check back soon."
                action={
                  <Link
                    href="/seeker/profile"
                    className="btn-primary rounded-xl px-6 py-2.5 text-sm"
                  >
                    Update Profile
                  </Link>
                }
              />
            ) : (
              <AnimatedGrid
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                delay={0.24}
              >
                {scoredJobs.map(({ job, score }, i) => (
                  <AnimatedGridItem key={job._id.toString()} index={i}>
                    <JobCard
                      job={{
                        ...job,
                        _id: job._id.toString(),
                        deadline: job.deadline,
                        companyId: job.companyId.toString(),
                      }}
                      companyName={companyNameMap[job.companyId.toString()]}
                      score={score}
                      isSaved={savedJobIdSet.has(job._id.toString())}
                      showActions
                    />
                  </AnimatedGridItem>
                ))}
              </AnimatedGrid>
            )}
          </AnimatedSection>
        </main>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[--color-bg]">
      <section className="bg-white border-b border-[--color-border]">
        <div className="page-container pt-20 pb-16 flex flex-col items-center text-center gap-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold">
              AI-powered job matching
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.07 }}
            className="text-5xl sm:text-6xl font-extrabold text-[--color-fg] leading-tight tracking-tight max-w-2xl"
          >
            Find your next <br />
            opportunity{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-700">
              smarter
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-base text-[--color-muted] max-w-md leading-relaxed"
          >
            HireHub ranks every job by your personal relevance score — so the
            best matches always float to the top.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="w-full flex justify-center mt-2"
          >
            <TopSearchBar targetPath="/seeker/search" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className="flex items-center gap-6 mt-4 text-sm text-[--color-muted]"
          >
            <span>
              <strong className="text-[--color-fg] font-semibold">
                {jobsCount}+
              </strong>{" "}
              open roles
            </span>
            <span className="w-1 h-1 rounded-full bg-[--color-border-2]" />
            <span>
              <strong className="text-[--color-fg] font-semibold">
                {hiringCompanies.length}
              </strong>{" "}
              companies hiring
            </span>
            <span className="w-1 h-1 rounded-full bg-[--color-border-2]" />
            <span>
              <strong className="text-[--color-fg] font-semibold">Free</strong>{" "}
              to join
            </span>
          </motion.div>
        </div>
      </section>

      <div className="page-container py-12 space-y-14">
        {hiringCompanies.length > 0 && (
          <AnimatedSection delay={0.05}>
            <div className="flex items-center justify-between mb-4">
              <p className="section-label">Actively Hiring</p>
              <span className="text-xs text-[--color-subtle]">
                {hiringCompanies.length} companies
              </span>
            </div>
            <div className="scroll-x">
              {hiringCompanies.map((company, i) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={`/companies/${company.id}`}
                    className="card card-hover shrink-0 flex items-center gap-3 px-5 py-4 min-w-[196px] max-w-[220px] group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-sm font-bold text-teal-600 shrink-0">
                      {company.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={company.logoUrl}
                          alt={company.companyName}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        company.companyName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[--color-fg] group-hover:text-teal-600 transition-colors truncate leading-tight">
                        {company.companyName}
                      </p>
                      {company.industry && (
                        <p className="text-[0.7rem] text-[--color-subtle] truncate mt-0.5">
                          {company.industry}
                        </p>
                      )}
                      <p className="text-[0.7rem] font-semibold text-teal-600 mt-1">
                        {company.jobCount} open{" "}
                        {company.jobCount === 1 ? "role" : "roles"}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection delay={0.1}>
          <div className="flex items-end justify-between pb-5 border-b border-[--color-border] mb-8">
            <div>
              <p className="section-label mb-1">Browse</p>
              <h2 className="text-xl font-bold text-[--color-fg] tracking-tight">
                Latest Positions
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[--color-subtle]">
                {scoredJobs.length} {scoredJobs.length === 1 ? "job" : "jobs"}
              </span>
              {!session && (
                <Link
                  href="/signup/seeker"
                  className="btn-outline rounded-full px-4 py-1.5 text-xs"
                >
                  Sign in for match scores ✦
                </Link>
              )}
            </div>
          </div>

          {scoredJobs.length === 0 ? (
            <div className="card p-16">
              <EmptyState
                heading="No jobs posted yet"
                subtext="Check back soon for new opportunities."
              />
            </div>
          ) : (
            <AnimatedGrid
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              delay={0.16}
            >
              {scoredJobs.map(({ job }, i) => (
                <AnimatedGridItem key={job._id.toString()} index={i}>
                  <JobCard
                    job={{
                      ...job,
                      _id: job._id.toString(),
                      deadline: job.deadline,
                      companyId: job.companyId.toString(),
                    }}
                    companyName={companyNameMap[job.companyId.toString()]}
                    showActions={false}
                  />
                  {!session && (
                    <p className="mt-2 text-center text-xs text-[--color-subtle]">
                      <Link
                        href="/login"
                        className="text-teal-600 font-semibold hover:underline"
                      >
                        Sign in to apply →
                      </Link>
                    </p>
                  )}
                </AnimatedGridItem>
              ))}
            </AnimatedGrid>
          )}
        </AnimatedSection>
      </div>
    </main>
  );
}
