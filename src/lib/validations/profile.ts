import { z } from "zod";
import { EXPERIENCE_LEVELS } from "../constants";

export const updateSeekerProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().max(1000, "Bio must be under 1000 characters").optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  location: z.string().optional(),
  skills: z.array(z.string().min(1)).optional(),
  interests: z.array(z.string().min(1)).optional(),
});

export const onboardingSchema = z.object({
  interests: z
    .array(z.string().min(1))
    .min(1, "Please select at least one interest"),
  skills: z
    .array(z.string().min(1))
    .min(1, "Please add at least one skill"),
  experienceLevel: z.enum(EXPERIENCE_LEVELS, {
    error: "Please select your experience level",
  }),
  location: z.string().min(2, "Please enter your location"),
});

export const updateCompanyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  description: z
    .string()
    .max(2000, "Description must be under 2000 characters")
    .optional(),
  industry: z.string().optional(),
  website: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type UpdateSeekerProfileInput = z.infer<typeof updateSeekerProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileSchema>;
