import { z } from "zod";

export const addTripMemberSchema = z.object({
  member_id: z.string().uuid(),
});

export type AddTripMemberInput = z.infer<typeof addTripMemberSchema>;
