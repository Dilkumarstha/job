"use client";

/**
 * AnimatedSection.tsx — scroll-aware section / grid animation primitives.
 *
 * Usage:
 *   import { AnimatedSection, AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedSection";
 *
 *   // Fade + slide-up a card when it enters the viewport:
 *   <AnimatedSection delay={0.1}>
 *     <div className="card">…</div>
 *   </AnimatedSection>
 *
 *   // Stagger-reveal a pill list:
 *   <AnimatedGrid className="flex flex-wrap gap-2">
 *     {skills.map(s => <AnimatedGridItem key={s}><span>{s}</span></AnimatedGridItem>)}
 *   </AnimatedGrid>
 */

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import React from "react";

// ─── Shared variants ────────────────────────────────────────────────────────

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay },
  }),
};

const gridContainerVariants: Variants = {
  hidden: {},
  visible: (delay: number = 0) => ({
    transition: { staggerChildren: 0.06, delayChildren: 0.05 + delay },
  }),
};

const gridItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── AnimatedSection ────────────────────────────────────────────────────────

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Seconds to delay the entrance animation (default: 0) */
  delay?: number;
  /** Override the wrapper element tag when you need semantics (default: div) */
  as?: keyof React.JSX.IntrinsicElements;
}

/**
 * Wraps any content in a fade-up entrance that triggers when the element
 * enters the viewport (`whileInView`), with a one-shot trigger (`once: true`).
 */
export function AnimatedSection({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: AnimatedSectionProps) {
  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={sectionVariants}
      custom={delay}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

// ─── AnimatedGrid ────────────────────────────────────────────────────────────

interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
  /** Seconds to delay the entrance animation (default: 0) */
  delay?: number;
}

/**
 * Stagger container for a list of `AnimatedGridItem` children.
 * Triggers when the grid enters the viewport.
 */
export function AnimatedGrid({ children, className, delay = 0 }: AnimatedGridProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={gridContainerVariants}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── AnimatedGridItem ────────────────────────────────────────────────────────

interface AnimatedGridItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

/**
 * Individual stagger child inside an `AnimatedGrid`.
 * Renders as an inline `motion.span` so it flows naturally inside flex/wrap
 * containers used for skill-pill lists.
 */
export function AnimatedGridItem({ children, className }: AnimatedGridItemProps) {
  return (
    <motion.span variants={gridItemVariants} className={className}>
      {children}
    </motion.span>
  );
}
