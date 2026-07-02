import { z } from "zod";
import { EXPERIENCE_LEVELS, JOB_CATEGORIES, JOB_TYPES } from "../constants";

// Base object without refinement — used by updateJobSchema
const jobBaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.enum(JOB_CATEGORIES, {
    error: "Please select a valid category",
  }),
  skillsRequired: z
    .array(z.string().min(1))
    .min(1, "At least one skill is required"),
  experienceLevel: z.enum(EXPERIENCE_LEVELS, {
    error: "Please select an experience level",
  }),
  salaryMin: z.coerce.number().min(0, "Minimum salary cannot be negative").optional(),
  salaryMax: z.coerce.number().min(0, "Maximum salary cannot be negative").optional(),
  location: z.string().min(2, "Location is required"),
  jobType: z.enum(JOB_TYPES, {
    error: "Please select a job type",
  }),
  deadline: z.coerce.date().min(new Date(), "Deadline must be in the future"),
});

// createJobSchema adds the salary range refinement on top
export const createJobSchema = jobBaseSchema.refine(
  (data) => !data.salaryMin || !data.salaryMax || data.salaryMax >= data.salaryMin,
  {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salaryMax"],
  }
);

// updateJobSchema uses the base (no refinement) so .partial() works
export const updateJobSchema = jobBaseSchema.partial().extend({
  status: z.enum(["ACTIVE", "EXPIRED", "CLOSED"]).optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
