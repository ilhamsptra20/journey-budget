import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import {
  expenseParticipants,
  members,
  type ExpenseType,
} from "@/infrastructure/db/schema";

class ExpenseParticipantRepository {
  async findByExpense(expenseType: ExpenseType, expenseId: string) {
    const db = getDb();

    return db
      .select({
        id: expenseParticipants.id,
        expense_type: expenseParticipants.expenseType,
        expense_id: expenseParticipants.expenseId,
        member_id: expenseParticipants.memberId,
        member_name: members.name,
        created_at: expenseParticipants.createdAt,
        updated_at: expenseParticipants.updatedAt,
      })
      .from(expenseParticipants)
      .innerJoin(members, eq(expenseParticipants.memberId, members.id))
      .where(
        and(
          eq(expenseParticipants.expenseType, expenseType),
          eq(expenseParticipants.expenseId, expenseId),
        ),
      );
  }

  async findMemberIdsByExpense(expenseType: ExpenseType, expenseId: string) {
    const db = getDb();
    const rows = await db
      .select({ memberId: expenseParticipants.memberId })
      .from(expenseParticipants)
      .where(
        and(
          eq(expenseParticipants.expenseType, expenseType),
          eq(expenseParticipants.expenseId, expenseId),
        ),
      );

    return rows.map((row) => row.memberId);
  }

  async createMany(expenseType: ExpenseType, expenseId: string, memberIds: string[]) {
    const db = getDb();
    return db
      .insert(expenseParticipants)
      .values(
        memberIds.map((memberId) => ({
          expenseType,
          expenseId,
          memberId,
        })),
      )
      .returning();
  }

  async deleteById(id: string) {
    const db = getDb();
    const [row] = await db
      .delete(expenseParticipants)
      .where(eq(expenseParticipants.id, id))
      .returning();

    return row ?? null;
  }

  async deleteByExpenseAndMembers(
    expenseType: ExpenseType,
    expenseId: string,
    memberIds: string[],
  ) {
    const db = getDb();
    return db
      .delete(expenseParticipants)
      .where(
        and(
          eq(expenseParticipants.expenseType, expenseType),
          eq(expenseParticipants.expenseId, expenseId),
          inArray(expenseParticipants.memberId, memberIds),
        ),
      )
      .returning();
  }
}

export const expenseParticipantRepository = new ExpenseParticipantRepository();
