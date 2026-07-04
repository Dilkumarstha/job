import { getAdminStats } from "@/actions/admin";
import {
  AnimatedSection,
  AnimatedGrid,
  AnimatedGridItem,
} from "@/components/ui/AnimatedSection";

import {
  Users,
  Building2,
  Clock3,
  Briefcase,
  Archive,
  FileText,
  UserPlus,
} from "lucide-react";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  if ("error" in stats) {
    return <p className="text-red-500">{stats.error}</p>;
  }

  // const cards = [
  //   { label: "Job Seekers", value: stats.totalSeekers,
  //     // icon: "👤",
  //     color: "teal" },
  //   { label: "Active Companies", value: stats.totalCompaniesActive,
  //     // icon: "🏢",
  //     color: "green" },
  //   { label: "Pending Companies", value: stats.totalCompaniesPending,
  //     // icon: "⏳",
  //     color: "amber" },
  //   { label: "Active Jobs", value: stats.totalJobsActive,
  //     // icon: "💼",
  //     color: "blue" },
  //   { label: "Expired Jobs", value: stats.totalJobsExpired,
  //     // icon: "📋",
  //     color: "gray" },
  //   { label: "Total Applications", value: stats.totalApplications,
  //     // icon: "📨",
  //     color: "purple" },
  //   { label: "Signups (7 days)", value: stats.recentSignups,
  //     // icon: "🆕",
  //     color: "teal" },
  // ];

  const cards = [
    {
      label: "Job Seekers",
      value: stats.totalSeekers,
      icon: Users,
      color: "teal",
      description: "Registered users",
    },
    {
      label: "Active Companies",
      value: stats.totalCompaniesActive,
      icon: Building2,
      color: "green",
      description: "Verified employers",
    },
    {
      label: "Pending Companies",
      value: stats.totalCompaniesPending,
      icon: Clock3,
      color: "amber",
      description: "Awaiting approval",
    },
    {
      label: "Active Jobs",
      value: stats.totalJobsActive,
      icon: Briefcase,
      color: "blue",
      description: "Currently hiring",
    },
    {
      label: "Expired Jobs",
      value: stats.totalJobsExpired,
      icon: Archive,
      color: "gray",
      description: "No longer active",
    },
    {
      label: "Applications",
      value: stats.totalApplications,
      icon: FileText,
      color: "purple",
      description: "Total received",
    },
    {
      label: "New Signups",
      value: stats.recentSignups,
      icon: UserPlus,
      color: "teal",
      description: "Last 7 days",
    },
  ];

  // const colorMap: Record<string, string> = {
  //   green: "border-green-200 bg-green-50",
  //   amber: "border-amber-200 bg-amber-50",
  //   blue: "border-blue-200 bg-blue-50",
  //   gray: "border-gray-200 bg-gray-50",
  //   purple: "border-purple-200 bg-purple-50",
  //   teal: "border-teal-200 bg-teal-50",
  // };

  const colorMap: Record<string, { bg: string; icon: string }> = {
    green: {
      bg: "bg-green-50",
      icon: "bg-green-100 text-green-600",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "bg-amber-100 text-amber-600",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "bg-blue-100 text-blue-600",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "bg-purple-100 text-purple-600",
    },
    teal: {
      bg: "bg-teal-50",
      icon: "bg-teal-100 text-teal-600",
    },
    gray: {
      bg: "bg-gray-50",
      icon: "bg-gray-100 text-gray-600",
    },
  };

  return (
    <div>
      {/* <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>
      </AnimatedSection> */}

      <AnimatedSection>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Overview of your recruitment platform.
            </p>
          </div>

          <div className="rounded-xl bg-white border px-4 py-2 shadow-sm">
            <p className="text-xs text-gray-500">Today's Date</p>
            <p className="font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </AnimatedSection>

      {/* <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <AnimatedGridItem key={c.label}>
            <div className={`rounded-xl border p-5 h-full ${colorMap[c.color] ?? "border-gray-200 bg-white"}`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              <div className="text-sm text-gray-600 mt-1">{c.label}</div>
            </div>
          </AnimatedGridItem>
        ))}
      </AnimatedGrid> */}

      <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const colors = colorMap[card.color];

          return (
            <AnimatedGridItem key={card.label}>
              <div
                className={`group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>

                    <h2 className="mt-2 text-4xl font-bold text-gray-900">
                      {card.value}
                    </h2>

                    <p className="mt-2 text-xs text-gray-500">
                      {card.description}
                    </p>
                  </div>

                  <div className={`rounded-xl p-3 ${colors.icon}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-5 h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors.bg}`}
                    style={{ width: "70%" }}
                  />
                </div>
              </div>
            </AnimatedGridItem>
          );
        })}
      </AnimatedGrid>
    </div>
  );
}
