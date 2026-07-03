"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import NotificationBell from "@/components/notifications/NotificationBell";

export type NavRole = "JOBSEEKER" | "COMPANY" | "SUPERADMIN" | null;

interface NavbarProps {
  role: NavRole;
  signOutSlot: React.ReactNode; // server-rendered sign-out form passed as a slot
}

const NAV_LINKS: Record<string, { href: string; label: string }[]> = {
  JOBSEEKER: [
    { href: "/", label: "Feed" },
    { href: "/seeker/search", label: "Search" },
    { href: "/seeker/applications", label: "My Applications" },
    { href: "/seeker/saved", label: "Saved Jobs" },
    { href: "/seeker/profile", label: "Profile" },
  ],
  COMPANY: [
    { href: "/company/dashboard", label: "Dashboard" },
    { href: "/company/jobs", label: "My Jobs" },
    { href: "/company/profile", label: "Company Profile" },
  ],
  SUPERADMIN: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/companies", label: "Companies" },
    { href: "/admin/audit", label: "Audit Log" },
  ],
};

const HOME_HREF: Record<string, string> = {
  JOBSEEKER: "/",
  COMPANY: "/company/dashboard",
  SUPERADMIN: "/admin/dashboard",
};

export default function Navbar({ role, signOutSlot }: NavbarProps) {
  const pathname = usePathname();
  const links = role ? (NAV_LINKS[role] ?? []) : [];
  const homeHref = role ? (HOME_HREF[role] ?? "/") : "/";
  const isAdmin = role === "SUPERADMIN";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-[--color-surface]/95 backdrop-blur-sm sticky top-0 z-40 shadow-xs">
      <div className="page-container h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href={homeHref}
          className="text-xl font-bold text-teal-600 shrink-0 tracking-tight"
        >
          HireHub
          {isAdmin && (
            <span className="ml-1.5 text-xs font-normal text-[--color-muted]">
              Admin
            </span>
          )}
        </Link>

        {/* Nav links */}
        {links.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm px-3 py-1.5 rounded-xl transition-colors ${
                    active
                      ? "text-teal-700 font-semibold"
                      : "text-[--color-muted] hover:text-[--color-fg]"
                  }`}
                >
                  <span className="relative">
                    {l.label}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{ transformOrigin: "center" }}
                        className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-teal-500"
                      />
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {role ? (
            <>
              <NotificationBell />
              <div className="w-px h-5 bg-[--color-border] mx-1" />
              {signOutSlot}
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost text-sm px-3 py-1.5 rounded-xl">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="px-3 py-1.5 text-sm font-medium bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
