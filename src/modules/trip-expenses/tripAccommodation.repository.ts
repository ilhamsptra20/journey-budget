import { and, eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { tripAccommodations } from "@/infrastructure/db/schema";

type TripAccommodationWritePayload = {
  accommodationItemId: string;
  scope: "group" | "personal";
  price: number;
  count: number;
};

class TripAccommodationRepository {
  async findByTripId(tripId: string) {
    const db = getDb();
    return db.select().from(tripAccommodations).where(eq(tripAccommodations.tripId, tripId));
  }

  async findByIdInTrip(tripId: string, id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(tripAccommodations)
      .where(and(eq(tripAccommodations.tripId, tripId), eq(tripAccommodations.id, id)))
      .limit(1);

    return row ?? null;
  }

  async findById(id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(tripAccommodations)
      .where(eq(tripAccommodations.id, id))
      .limit(1);

    return row ?? null;
  }

  async create(tripId: string, payload: TripAccommodationWritePayload) {
    const db = getDb();
    const [row] = await db
      .insert(tripAccommodations)
      .values({
        tripId,
        accommodationItemId: payload.accommodationItemId,
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
    payload: Partial<TripAccommodationWritePayload>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(tripAccommodations)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(and(eq(tripAccommodations.tripId, tripId), eq(tripAccommodations.id, id)))
      .returning();

    return row ?? null;
  }

  async delete(tripId: string, id: string) {
    const db = getDb();
    const [row] = await db
      .delete(tripAccommodations)
      .where(and(eq(tripAccommodations.tripId, tripId), eq(tripAccommodations.id, id)))
      .returning();

    return row ?? null;
  }
}

export const tripAccommodationRepository = new TripAccommodationRepository();
