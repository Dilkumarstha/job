"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, slideDownVariants, popVariants, staggerItemVariants } from "@/components/ui/Motion";

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    jobId?: string;
    jobTitle?: string;
    companyName?: string;
  };
}

const POLL_INTERVAL = 30_000;

const TYPE_META: Record<string, { icon: string; color: string }> = {
  APPLICATION_STATUS_CHANGED: { icon: "📋", color: "bg-blue-50 border-blue-100"   },
  NEW_JOB_POSTED:             { icon: "✨", color: "bg-teal-50 border-teal-100"   },
  ACCOUNT_SUSPENDED:          { icon: "🚫", color: "bg-red-50  border-red-100"    },
  ACCOUNT_REACTIVATED:        { icon: "✅", color: "bg-green-50 border-green-100" },
  COMPANY_APPROVED:           { icon: "🎉", color: "bg-teal-50 border-teal-100"   },
  COMPANY_REJECTED:           { icon: "❌", color: "bg-red-50  border-red-100"    },
};

const DEFAULT_META = { icon: "🔔", color: "bg-slate-50 border-slate-100" };

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchUnread = async () => {
    try {
      const res = await fetch("/api/notifications?unreadOnly=true");
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch { /* silent */ }
  };

  const openPanel = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(0);
      setOpen(true);
      await fetch("/api/notifications/read", { method: "POST" });
    } catch { /* silent */ }
  };

  const clearAll = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
  };

  useEffect(() => {
    fetchUnread();
    const id = setInterval(fetchUnread, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={open ? () => setOpen(false) : openPanel}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl text-[--color-muted] hover:text-[--color-fg] hover:bg-[--color-surface-2] transition-all"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              variants={popVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

          {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            variants={slideDownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-[22rem] z-50 overflow-hidden origin-top-right
              bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl shadow-black/5 rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/80">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">Notifications</span>
                {notifications.length > 0 && (
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-white/60 transition mr-1"
                  >
                    Clear all
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white/60 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[22rem] overflow-y-auto divide-y divide-gray-100/60">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400"
                >
                  <span className="text-3xl">🔔</span>
                  <p className="text-sm">You&apos;re all caught up!</p>
                </motion.div>
              ) : (
                notifications.map((n, i) => {
                  const meta = TYPE_META[n.type] ?? DEFAULT_META;
                  const jobId = n.metadata?.jobId;

                  const href = jobId
                    ? `/jobs/${jobId}`
                    : n.type === "COMPANY_APPROVED"
                    ? "/company/dashboard"
                    : n.type === "ACCOUNT_SUSPENDED"
                    ? "/suspended"
                    : n.type === "ACCOUNT_REACTIVATED"
                    ? "/"
                    : null;

                  const content = (
                    <>
                      <span className={`w-8 h-8 shrink-0 rounded-xl border flex items-center justify-center text-base shadow-sm ${meta.color}`}>
                        {meta.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 leading-snug">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 mt-1.5 ring-2 ring-teal-100" />
                      )}
                    </>
                  );

                  if (href) {
                    return (
                      <motion.a
                        key={n._id}
                        variants={staggerItemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: i * 0.04 }}
                        href={href}
                        onClick={() => {
                          fetch(`/api/notifications?id=${n._id}`, { method: "DELETE" });
                        }}
                        className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors no-underline ${
                          !n.read ? "bg-teal-50/40" : ""
                        } hover:bg-white/60`}
                      >
                        {content}
                      </motion.a>
                    );
                  }

                  return (
                    <motion.div
                      key={n._id}
                      variants={staggerItemVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        fetch(`/api/notifications?id=${n._id}`, { method: "DELETE" });
                        setNotifications((prev) => prev.filter((item) => item._id !== n._id));
                      }}
                      className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors ${
                        !n.read ? "bg-teal-50/40" : ""
                      } hover:bg-white/60`}
                    >
                      {content}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
