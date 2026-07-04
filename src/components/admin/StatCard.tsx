"use client";

import { useEffect, useRef, useState } from "react";
import {
  TrendingUp, Users, Building2, Clock3,
  Briefcase, Archive, FileText, UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Icon name → component map (all resolved client-side)
const ICON_MAP: Record<string, LucideIcon> = {
  Users, Building2, Clock3, Briefcase, Archive, FileText, UserPlus,
};

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: string;          // plain string — safe to pass from Server Component
  iconBg: string;
  iconColor: string;
  barColor: string;
  barPct?: number;
  trend?: string;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            setCount(Math.round(eased * target));
            if (elapsed < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

export default function StatCard({
  label,
  value,
  description,
  icon,
  iconBg,
  iconColor,
  barColor,
  barPct = 70,
  trend,
}: StatCardProps) {
  const { count, ref } = useCountUp(value);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(barPct), 300);
    return () => clearTimeout(t);
  }, [barPct]);

  const Icon = ICON_MAP[icon] ?? Users;

  return (
    <div
      ref={ref}
      className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* subtle corner glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 ${iconBg}`} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
          <p className="mt-2 text-4xl font-bold text-gray-900 tabular-nums">{count}</p>
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        </div>
        <div className={`shrink-0 rounded-xl p-3 ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1 text-emerald-600 text-xs font-medium">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{trend}</span>
        </div>
      )}

      {/* animated progress bar */}
      <div className="mt-4 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}
