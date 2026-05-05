import { and, eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { tripLogistics } from "@/infrastructure/db/schema";

type TripLogisticWritePayload = {
  logisticItemId: string;
  acquisitionType: "beli" | "sewa" | "bawa_sendiri" | "pinjam";
  scope: "group" | "personal";
  costType: "paid" | "free";
  price?: number | null;
  count: number;
  duration?: number | null;
};

class TripLogisticRepository {
  async findByTripId(tripId: string) {
    const db = getDb();
    return db.select().from(tripLogistics).where(eq(tripLogistics.tripId, tripId));
  }

  async findByIdInTrip(tripId: string, id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(tripLogistics)
      .where(and(eq(tripLogistics.tripId, tripId), eq(tripLogistics.id, id)))
      .limit(1);

    return row ?? null;
  }

  async findById(id: string) {
    const db = getDb();
    const [row] = await db.select().from(tripLogistics).where(eq(tripLogistics.id, id)).limit(1);
    return row ?? null;
  }

  async create(tripId: string, payload: TripLogisticWritePayload) {
    const db = getDb();
    const [row] = await db
      .insert(tripLogistics)
      .values({
        tripId,
        logisticItemId: payload.logisticItemId,
        acquisitionType: payload.acquisitionType,
        scope: payload.scope,
        costType: payload.costType,
        price: payload.price ?? null,
        count: payload.count,
        duration: payload.duration ?? null,
      })
      .returning();

    return row;
  }

  async update(
    tripId: string,
    id: string,
    payload: Partial<TripLogisticWritePayload>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(tripLogistics)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(and(eq(tripLogistics.tripId, tripId), eq(tripLogistics.id, id)))
      .returning();

    return row ?? null;
  }

  async delete(tripId: string, id: string) {
    const db = getDb();
    const [row] = await db
      .delete(tripLogistics)
      .where(and(eq(tripLogistics.tripId, tripId), eq(tripLogistics.id, id)))
      .returning();

    return row ?? null;
  }
}

export const tripLogisticRepository = new TripLogisticRepository();
