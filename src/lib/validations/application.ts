import { z } from "zod";

export const reviewApplicationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "REVIEWED"]),
  message: z.string().min(10, "Please provide a message of at least 10 characters"),
});

export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
