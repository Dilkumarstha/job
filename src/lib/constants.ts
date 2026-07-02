export const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Customer Support",
  "Human Resources",
  "Legal",
  "Product",
  "Data & Analytics",
  "Healthcare",
  "Education",
  "Writing & Content",
  "Research",
  "Other",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

export const EXPERIENCE_LEVELS = [
  "ENTRY",
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD",
] as const;

export type ExperienceLevelConst = (typeof EXPERIENCE_LEVELS)[number];

export const JOB_TYPES = ["REMOTE", "ONSITE", "HYBRID"] as const;

export type JobTypeConst = (typeof JOB_TYPES)[number];

// Order matters for adjacency check in matchScore
export const EXPERIENCE_LEVEL_ORDER: Record<string, number> = {
  ENTRY: 0,
  JUNIOR: 1,
  MID: 2,
  SENIOR: 3,
  LEAD: 4,
};
