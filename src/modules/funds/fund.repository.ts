import { and, eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { funds } from "@/infrastructure/db/schema";

type FundWritePayload = {
  type: "kolektif" | "donatur";
  memberId?: string | null;
  sourceName?: string | null;
  amount: number;
  paidAt?: Date | null;
  method?: string | null;
  note?: string | null;
};

class FundRepository {
  async findByTripId(tripId: string) {
    const db = getDb();
    return db.select().from(funds).where(eq(funds.tripId, tripId));
  }

  async findByIdInTrip(tripId: string, id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(funds)
      .where(and(eq(funds.tripId, tripId), eq(funds.id, id)))
      .limit(1);

    return row ?? null;
  }

  async create(tripId: string, payload: FundWritePayload) {
    const db = getDb();
    const [row] = await db
      .insert(funds)
      .values({
        tripId,
        type: payload.type,
        memberId: payload.memberId ?? null,
        sourceName: payload.sourceName ?? null,
        amount: payload.amount,
        paidAt: payload.paidAt ?? null,
        method: payload.method ?? null,
        note: payload.note ?? null,
      })
      .returning();

    return row;
  }

  async update(tripId: string, id: string, payload: Partial<FundWritePayload>) {
    const db = getDb();
    const [row] = await db
      .update(funds)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(and(eq(funds.tripId, tripId), eq(funds.id, id)))
      .returning();

    return row ?? null;
  }

  async delete(tripId: string, id: string) {
    const db = getDb();
    const [row] = await db
      .delete(funds)
      .where(and(eq(funds.tripId, tripId), eq(funds.id, id)))
      .returning();

    return row ?? null;
  }
}

export const fundRepository = new FundRepository();
