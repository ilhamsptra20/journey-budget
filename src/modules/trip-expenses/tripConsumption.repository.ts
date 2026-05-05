import { and, eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { tripConsumptions } from "@/infrastructure/db/schema";

type TripConsumptionWritePayload = {
  consumptionItemId: string;
  time: "pagi" | "siang" | "malam" | "perjalanan" | "camp" | "summit" | "other";
  scope: "group" | "personal";
  price: number;
  count: number;
};

class TripConsumptionRepository {
  async findByTripId(tripId: string) {
    const db = getDb();
    return db.select().from(tripConsumptions).where(eq(tripConsumptions.tripId, tripId));
  }

  async findByIdInTrip(tripId: string, id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(tripConsumptions)
      .where(and(eq(tripConsumptions.tripId, tripId), eq(tripConsumptions.id, id)))
      .limit(1);

    return row ?? null;
  }

  async findById(id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(tripConsumptions)
      .where(eq(tripConsumptions.id, id))
      .limit(1);

    return row ?? null;
  }

  async create(tripId: string, payload: TripConsumptionWritePayload) {
    const db = getDb();
    const [row] = await db
      .insert(tripConsumptions)
      .values({
        tripId,
        consumptionItemId: payload.consumptionItemId,
        time: payload.time,
        scope: payload.scope,
        price: payload.price,
        count: payload.count,
      })
      .returning();

    return row;
  }

  async update(
    tripId: string,
    id: string,
    payload: Partial<TripConsumptionWritePayload>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(tripConsumptions)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(and(eq(tripConsumptions.tripId, tripId), eq(tripConsumptions.id, id)))
      .returning();

    return row ?? null;
  }

  async delete(tripId: string, id: string) {
    const db = getDb();
    const [row] = await db
      .delete(tripConsumptions)
      .where(and(eq(tripConsumptions.tripId, tripId), eq(tripConsumptions.id, id)))
      .returning();

    return row ?? null;
  }
}

export const tripConsumptionRepository = new TripConsumptionRepository();
