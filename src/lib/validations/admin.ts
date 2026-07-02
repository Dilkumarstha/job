import { z } from "zod";

export const suspendUserSchema = z.object({
  reason: z.string().min(10, "Please provide a reason of at least 10 characters"),
  suspendedUntil: z.coerce.date().optional().nullable(),
});

export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
