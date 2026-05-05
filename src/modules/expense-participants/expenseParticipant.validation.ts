import { z } from "zod";

export const expenseTypeSchema = z.enum([
  "trip_logistics",
  "trip_consumptions",
  "trip_accommodations",
]);

export const listExpenseParticipantSchema = z.object({
  expenseType: expenseTypeSchema,
  expenseId: z.string().uuid(),
});

export const createExpenseParticipantSchema = z.object({
  expense_type: expenseTypeSchema,
  expense_id: z.string().uuid(),
  member_ids: z.array(z.string().uuid()).min(1),
});

export type ExpenseTypeInput = z.infer<typeof expenseTypeSchema>;
export type ListExpenseParticipantInput = z.infer<typeof listExpenseParticipantSchema>;
export type CreateExpenseParticipantInput = z.infer<typeof createExpenseParticipantSchema>;
