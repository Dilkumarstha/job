import { getAdminStats } from "@/actions/admin";
import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  if ("error" in stats) {
    return <p className="text-red-500">{stats.error}</p>;
  }

  const cards = [
    { label: "Job Seekers", value: stats.totalSeekers, icon: "👤", color: "indigo" },
    { label: "Active Companies", value: stats.totalCompaniesActive, icon: "🏢", color: "green" },
    { label: "Pending Companies", value: stats.totalCompaniesPending, icon: "⏳", color: "amber" },
    { label: "Active Jobs", value: stats.totalJobsActive, icon: "💼", color: "blue" },
    { label: "Expired Jobs", value: stats.totalJobsExpired, icon: "📋", color: "gray" },
    { label: "Total Applications", value: stats.totalApplications, icon: "📨", color: "purple" },
    { label: "Signups (7 days)", value: stats.recentSignups, icon: "🆕", color: "teal" },
  ];

  const colorMap: Record<string, string> = {
    indigo: "border-indigo-200 bg-indigo-50",
    green: "border-green-200 bg-green-50",
    amber: "border-amber-200 bg-amber-50",
    blue: "border-blue-200 bg-blue-50",
    gray: "border-gray-200 bg-gray-50",
    purple: "border-purple-200 bg-purple-50",
    teal: "border-teal-200 bg-teal-50",
  };

  return (
    <div>
      <AnimatedSection>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h1>
      </AnimatedSection>
      <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <AnimatedGridItem key={c.label}>
            <div className={`rounded-xl border p-5 h-full ${colorMap[c.color] ?? "border-gray-200 bg-white"}`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{c.value}</div>
              <div className="text-sm text-gray-600 mt-1">{c.label}</div>
            </div>
          </AnimatedGridItem>
        ))}
      </AnimatedGrid>
    </div>
  );
}
