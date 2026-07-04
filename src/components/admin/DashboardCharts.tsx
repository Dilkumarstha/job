"use client";

import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const TEAL_PALETTE = [
  "#0d9488","#14b8a6","#2dd4bf",
  "#5eead4","#99f6e4","#ccfbf1","#f0fdfa","#115e59",
];

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const, labels: { boxWidth: 12, font: { size: 12 } } },
  },
};

// ── Applications over time (Line) ─────────────────────────────────────────────
interface LineChartProps {
  labels: string[];
  applied: number[];
  accepted: number[];
  rejected: number[];
}

export function ApplicationsLineChart({ labels, applied, accepted, rejected }: LineChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: "Applied",
        data: applied,
        borderColor: "#0d9488",
        backgroundColor: "rgba(13,148,136,0.10)",
        fill: true, tension: 0.4, pointRadius: 4,
      },
      {
        label: "Accepted",
        data: accepted,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        fill: true, tension: 0.4, pointRadius: 4,
      },
      {
        label: "Rejected",
        data: rejected,
        borderColor: "#f43f5e",
        backgroundColor: "rgba(244,63,94,0.08)",
        fill: true, tension: 0.4, pointRadius: 4,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Applications Over Time</h3>
      <div className="h-56">
        <Line
          data={data}
          options={{
            ...baseOptions,
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
            },
          }}
        />
      </div>
    </div>
  );
}

// ── Weekly user registrations (Bar) ──────────────────────────────────────────
interface WeeklySignupsProps {
  labels: string[];
  counts: number[];
}

export function WeeklySignupsBarChart({ labels, counts }: WeeklySignupsProps) {
  const data = {
    labels,
    datasets: [
      {
        label: "New Users",
        data: counts,
        backgroundColor: "rgba(13,148,136,0.80)",
        borderRadius: 6,
        borderSkipped: false as const,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly User Registrations</h3>
      <div className="h-56">
        <Bar
          data={data}
          options={{
            ...baseOptions,
            plugins: { ...baseOptions.plugins, legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { font: { size: 11 } } },
              y: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
            },
          }}
        />
      </div>
    </div>
  );
}

// ── Jobs by category (Doughnut) ───────────────────────────────────────────────
interface DoughnutProps {
  labels: string[];
  counts: number[];
}

export function JobsByCategoryDoughnut({ labels, counts }: DoughnutProps) {
  const data = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: TEAL_PALETTE.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Jobs by Category</h3>
      <div className="h-56">
        <Doughnut
          data={data}
          options={{
            ...baseOptions,
            cutout: "65%",
            plugins: {
              ...baseOptions.plugins,
              legend: { position: "right" as const, labels: { boxWidth: 10, font: { size: 11 } } },
            },
          }}
        />
      </div>
    </div>
  );
}

// ── Company verification status (Horizontal Bar) ──────────────────────────────
interface CompanyStatusProps {
  verified: number;
  pending: number;
  suspended: number;
}

export function CompanyStatusBarChart({ verified, pending, suspended }: CompanyStatusProps) {
  const data = {
    labels: ["Verified", "Pending", "Suspended"],
    datasets: [
      {
        label: "Companies",
        data: [verified, pending, suspended],
        backgroundColor: ["#0d9488", "#f59e0b", "#f43f5e"],
        borderRadius: 6,
        borderSkipped: false as const,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Company Verification Status</h3>
      <div className="h-56">
        <Bar
          data={data}
          options={{
            ...baseOptions,
            indexAxis: "y" as const,
            plugins: { ...baseOptions.plugins, legend: { display: false } },
            scales: {
              x: { grid: { color: "#f1f5f9" }, ticks: { font: { size: 11 } } },
              y: { grid: { display: false }, ticks: { font: { size: 12 } } },
            },
          }}
        />
      </div>
    </div>
  );
}
