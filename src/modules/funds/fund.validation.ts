import { z } from "zod";

const baseFundSchema = z
  .object({
    type: z.enum(["kolektif", "donatur"]),
    member_id: z.string().uuid().nullish(),
    source_name: z.string().trim().min(1).max(255).nullish(),
    amount: z.number().min(0, "amount cannot be negative"),
    paid_at: z.string().datetime().nullish(),
    method: z.string().trim().min(1).max(100).nullish(),
    note: z.string().trim().max(500).nullish(),
  })
  .superRefine((payload, ctx) => {
    if (payload.type === "kolektif" && !payload.member_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["member_id"],
        message: "member_id is required for kolektif fund",
      });
    }

    if (payload.type === "donatur") {
      if (payload.member_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["member_id"],
          message: "member_id must be empty for donatur fund",
        });
      }

      if (!payload.source_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["source_name"],
          message: "source_name is required for donatur fund",
        });
      }
    }
  });

export const createFundSchema = baseFundSchema;

export const updateFundSchema = z
  .object({
    type: z.enum(["kolektif", "donatur"]).optional(),
    member_id: z.string().uuid().nullish().optional(),
    source_name: z.string().trim().min(1).max(255).nullish().optional(),
    amount: z.number().min(0, "amount cannot be negative").optional(),
    paid_at: z.string().datetime().nullish().optional(),
    method: z.string().trim().min(1).max(100).nullish().optional(),
    note: z.string().trim().max(500).nullish().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateFundInput = z.infer<typeof createFundSchema>;
export type UpdateFundInput = z.infer<typeof updateFundSchema>;
