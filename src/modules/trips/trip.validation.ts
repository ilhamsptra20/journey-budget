import { z } from "zod";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const createTripSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    location: z.string().trim().min(1).max(255),
    start_date: dateStringSchema,
    end_date: dateStringSchema.nullish(),
  })
  .superRefine((payload, ctx) => {
    if (payload.end_date && payload.start_date > payload.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "start_date cannot be after end_date",
      });
    }
  });

export const updateTripSchema = z
  .object({
    title: z.string().trim().min(1).max(255).optional(),
    location: z.string().trim().min(1).max(255).optional(),
    start_date: dateStringSchema.optional(),
    end_date: dateStringSchema.nullish().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  })
  .superRefine((payload, ctx) => {
    if (payload.start_date && payload.end_date && payload.start_date > payload.end_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date"],
        message: "start_date cannot be after end_date",
      });
    }
  });

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
