import { z } from "zod";

export const createMemberSchema = z.object({
  name: z.string().trim().min(1).max(150),
});

export const updateMemberSchema = createMemberSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field must be provided",
  },
);

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
