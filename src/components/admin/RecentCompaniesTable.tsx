"use client";

import { CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export interface CompanyRow {
  id: string;
  name: string;
  industry: string;
  status: "ACTIVE" | "PENDING_APPROVAL" | "SUSPENDED";
  joinedAt: string;
  jobs: number;
}

const statusConfig = {
  ACTIVE:           { label: "Verified",  bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  PENDING_APPROVAL: { label: "Pending",   bg: "bg-amber-50",   text: "text-amber-700",   icon: Clock        },
  SUSPENDED:        { label: "Suspended", bg: "bg-red-50",     text: "text-red-700",     icon: XCircle      },
};

export default function RecentCompaniesTable({ companies }: { companies: CompanyRow[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-700">Recent Companies</h3>
        <Link
          href="/admin/companies"
          className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
        >
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs">Company</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs">Industry</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs">Joined</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs">Jobs</th>
              <th className="text-left py-2 pr-4 font-medium text-gray-500 text-xs">Status</th>
              <th className="py-2 font-medium text-gray-500 text-xs">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {companies.map((co) => {
              const cfg = statusConfig[co.status];
              const StatusIcon = cfg.icon;
              return (
                <tr key={co.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 pr-4 font-medium text-gray-800">{co.name}</td>
                  <td className="py-3 pr-4 text-gray-500">{co.industry}</td>
                  <td className="py-3 pr-4 text-gray-500">{co.joinedAt}</td>
                  <td className="py-3 pr-4 text-gray-500">{co.jobs}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <Link
                      href="/admin/companies"
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {companies.map((co) => {
          const cfg = statusConfig[co.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={co.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{co.name}</p>
                <p className="text-xs text-gray-400">{co.industry} · {co.joinedAt}</p>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                <StatusIcon className="h-3 w-3" />
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
