"use client";

import { motion } from "@/components/ui/Motion";

interface EmptyStateProps {
  icon?: string;
  heading: string;
  subtext?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = "", heading, subtext, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 text-center px-4"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-4xl mb-5 shadow-sm"
        >
          {icon}
        </motion.div>
      )}

      <h3 className="text-base font-semibold text-[--color-fg] mb-1.5">{heading}</h3>

      {subtext && (
        <p className="text-sm text-[--color-muted] max-w-xs leading-relaxed">{subtext}</p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
