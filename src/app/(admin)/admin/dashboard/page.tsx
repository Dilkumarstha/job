import { getAdminStats, getApplicationsOverTime, getWeeklySignups, getJobsByCategory, getCompanyStatusCounts, getRecentActivityFeed, getRecentCompanies } from "@/actions/admin";
import { CalendarDays } from "lucide-react";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";
import StatCard from "@/components/admin/StatCard";
import DashboardSearchBar from "@/components/admin/DashboardSearchBar";
import RecentActivity from "@/components/admin/RecentActivity";
import RecentCompaniesTable from "@/components/admin/RecentCompaniesTable";
import {
  ApplicationsLineChart,
  WeeklySignupsBarChart,
  JobsByCategoryDoughnut,
  CompanyStatusBarChart,
} from "@/components/admin/DashboardCharts";

// ─── card definitions ────────────────────────────────────────────────────────
// icon is a plain string key — safe to pass to Client Components
function buildCards(stats: {
  totalSeekers: number;
  totalCompaniesActive: number;
  totalCompaniesPending: number;
  totalJobsActive: number;
  totalJobsExpired: number;
  totalApplications: number;
  recentSignups: number;
}) {
  return [
    {
      label: "Job Seekers",
      value: stats.totalSeekers,
      description: "Registered users",
      icon: "Users",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      barColor: "bg-teal-500",
      barPct: 72,
      trend: "+8% this week",
    },
    {
      label: "Active Companies",
      value: stats.totalCompaniesActive,
      description: "Verified employers",
      icon: "Building2",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      barColor: "bg-emerald-500",
      barPct: 85,
      trend: "+3 this month",
    },
    {
      label: "Pending Companies",
      value: stats.totalCompaniesPending,
      description: "Awaiting approval",
      icon: "Clock3",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      barColor: "bg-amber-400",
      barPct: 35,
    },
    {
      label: "Active Jobs",
      value: stats.totalJobsActive,
      description: "Currently hiring",
      icon: "Briefcase",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      barColor: "bg-blue-500",
      barPct: 60,
      trend: "+12 this week",
    },
    {
      label: "Expired Jobs",
      value: stats.totalJobsExpired,
      description: "No longer active",
      icon: "Archive",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      barColor: "bg-gray-400",
      barPct: 45,
    },
    {
      label: "Total Applications",
      value: stats.totalApplications,
      description: "All time",
      icon: "FileText",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      barColor: "bg-purple-500",
      barPct: 78,
      trend: "+24 this week",
    },
    {
      label: "New Signups",
      value: stats.recentSignups,
      description: "Last 7 days",
      icon: "UserPlus",
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
      barColor: "bg-teal-400",
      barPct: 55,
      trend: "vs prev. week",
    },
  ];
}

export default async function AdminDashboard() {
  const [
    stats,
    appOverTime,
    weeklySignups,
    jobsByCategory,
    companyStatus,
    activityFeed,
    recentCompanies,
  ] = await Promise.all([
    getAdminStats(),
    getApplicationsOverTime(),
    getWeeklySignups(),
    getJobsByCategory(),
    getCompanyStatusCounts(),
    getRecentActivityFeed(6),
    getRecentCompanies(5),
  ]);

  if ("error" in stats) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-600 text-sm">
        {stats.error}
      </div>
    );
  }

  const cards = buildCards(stats);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // Safely extract chart data (guard against auth errors)
  const lineData = "error" in appOverTime
    ? { labels: [], applied: [], accepted: [], rejected: [] }
    : appOverTime;

  const weekData = "error" in weeklySignups
    ? { labels: [], counts: [] }
    : weeklySignups;

  const catData = "error" in jobsByCategory
    ? { labels: [], counts: [] }
    : jobsByCategory;

  const coStatus = "error" in companyStatus
    ? { verified: 0, pending: 0, suspended: 0 }
    : companyStatus;

  const activity = Array.isArray(activityFeed) ? activityFeed : [];
  const companies = Array.isArray(recentCompanies) ? recentCompanies : [];

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <AnimatedSection>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Overview of your recruitment platform
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <DashboardSearchBar />

            {/* date card */}
            <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 shadow-sm shrink-0">
              <CalendarDays className="h-4 w-4 text-teal-500" />
              <div suppressHydrationWarning>
                <p className="text-xs text-gray-400 leading-none">Today</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5" suppressHydrationWarning>
                  {today}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Stat Cards ── */}
      <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <AnimatedGridItem key={card.label}>
            <StatCard {...card} />
          </AnimatedGridItem>
        ))}
      </AnimatedGrid>

      {/* ── Charts row 1: Line + Bar ── */}
      <AnimatedSection delay={0.1}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <ApplicationsLineChart {...lineData} />
          <WeeklySignupsBarChart {...weekData} />
        </div>
      </AnimatedSection>

      {/* ── Charts row 2: Doughnut + Horizontal Bar ── */}
      <AnimatedSection delay={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <JobsByCategoryDoughnut {...catData} />
          <CompanyStatusBarChart {...coStatus} />
        </div>
      </AnimatedSection>

      {/* ── Bottom row: Activity + Companies table ── */}
      <AnimatedSection delay={0.2}>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <RecentActivity items={activity} />
          <RecentCompaniesTable companies={companies} />
        </div>
      </AnimatedSection>

    </div>
  );
}
