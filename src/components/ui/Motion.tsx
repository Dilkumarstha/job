"use client";

/**
 * Motion.tsx — shared Framer Motion primitives for HireHub.
 *
 * Usage:
 *   import { FadeUp, FadeIn, SlideDown, StaggerList, StaggerItem, ScaleIn } from "@/components/ui/Motion";
 *
 *   <FadeUp>content</FadeUp>
 *   <StaggerList><StaggerItem>…</StaggerItem></StaggerList>
 */

import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { ReactNode } from "react";

// ─── Variant definitions ────────────────────────────────────────────────────

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

export const slideDownVariants: Variants = {
  hidden: { opacity: 0, y: -10, scaleY: 0.97 },
  visible: { opacity: 1, y: 0, scaleY: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, scaleY: 0.97, transition: { duration: 0.15, ease: "easeIn" } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.18, ease: "easeIn" } },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};

export const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export const popVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 25 } },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};

// ─── Convenience wrapper components ────────────────────────────────────────

interface WrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Fade + slide up on mount */
export function FadeUp({ children, className, delay = 0 }: WrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Simple opacity fade on mount */
export function FadeIn({ children, className, delay = 0 }: WrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Scale + fade on mount */
export function ScaleIn({ children, className, delay = 0 }: WrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={scaleInVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — wraps a list; each StaggerItem animates in sequence */
export function StaggerList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Individual item inside a StaggerList */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/** Slide in from left */
export function SlideRight({ children, className, delay = 0 }: WrapperProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={slideRightVariants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Re-export AnimatePresence for convenience */
export { AnimatePresence, motion };
