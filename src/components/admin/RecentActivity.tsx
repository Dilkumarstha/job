"use client";

import {
  CheckCircle2, UserPlus, Building2,
  AlertTriangle, XCircle, RefreshCw, Trash2, UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface ActivityItem {
  id: string;
  action: string;
  target: string;
  role: string;
  reason: string;
  createdAt: string; // ISO string — safe to pass from server
}

const ACTION_CONFIG: Record<string, {
  icon: LucideIcon; iconBg: string; iconColor: string;
  label: string; badgeBg: string;
}> = {
  APPROVE_COMPANY:  { icon: CheckCircle2,  iconBg: "bg-emerald-50", iconColor: "text-emerald-600", label: "Company Approved",   badgeBg: "bg-emerald-50 text-emerald-700" },
  REJECT_COMPANY:   { icon: XCircle,       iconBg: "bg-red-50",     iconColor: "text-red-600",     label: "Company Rejected",   badgeBg: "bg-red-50 text-red-700"         },
  SUSPEND_USER:     { icon: AlertTriangle, iconBg: "bg-orange-50",  iconColor: "text-orange-600",  label: "User Suspended",     badgeBg: "bg-orange-50 text-orange-700"   },
  REACTIVATE_USER:  { icon: RefreshCw,     iconBg: "bg-teal-50",    iconColor: "text-teal-600",    label: "User Reactivated",   badgeBg: "bg-teal-50 text-teal-700"       },
  DELETE_USER:      { icon: Trash2,        iconBg: "bg-gray-100",   iconColor: "text-gray-600",    label: "User Deleted",       badgeBg: "bg-gray-100 text-gray-600"      },
  UPDATE_USER:      { icon: UserCog,       iconBg: "bg-blue-50",    iconColor: "text-blue-600",    label: "User Updated",       badgeBg: "bg-blue-50 text-blue-700"       },
};

const FALLBACK = {
  icon: UserPlus, iconBg: "bg-teal-50", iconColor: "text-teal-600",
  label: "Admin Action", badgeBg: "bg-teal-50 text-teal-700",
};

function actionLabel(action: string, role: string): string {
  const map: Record<string, string> = {
    APPROVE_COMPANY: "Company account approved",
    REJECT_COMPANY:  "Company account rejected",
    SUSPEND_USER:    role === "COMPANY" ? "Company suspended" : "User account suspended",
    REACTIVATE_USER: "Account reactivated",
    DELETE_USER:     "User removed from platform",
    UPDATE_USER:     "User profile updated",
  };
  return map[action] ?? action;
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (!items.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Recent Activity</h3>
        <p className="text-sm text-gray-400 text-center py-8">No admin activity yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-5">Recent Activity</h3>
      <ul className="space-y-4">
        {items.map((item) => {
          const cfg = ACTION_CONFIG[item.action] ?? FALLBACK;
          const Icon = cfg.icon;
          const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

          return (
            <li key={item.id} className="flex items-start gap-3">
              <div className={`shrink-0 rounded-xl p-2 ${cfg.iconBg}`}>
                <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {actionLabel(item.action, item.role)}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {item.target}{item.reason ? ` · ${item.reason}` : ""}
                </p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeBg}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-gray-400">{timeAgo}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
