import { eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { trips } from "@/infrastructure/db/schema";

class TripRepository {
  async findAll() {
    const db = getDb();
    return db.select().from(trips);
  }

  async findById(id: string) {
    const db = getDb();
    const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
    return trip ?? null;
  }

  async findByPublicReportToken(token: string) {
    const db = getDb();
    const [trip] = await db
      .select()
      .from(trips)
      .where(eq(trips.publicReportToken, token))
      .limit(1);
    return trip ?? null;
  }

  async create(payload: {
    title: string;
    location: string;
    startDate: string;
    endDate?: string | null;
  }) {
    const db = getDb();
    const [trip] = await db
      .insert(trips)
      .values({
        title: payload.title,
        location: payload.location,
        startDate: payload.startDate,
        endDate: payload.endDate ?? null,
      })
      .returning();

    return trip;
  }

  async update(
    id: string,
    payload: Partial<{
      title: string;
      location: string;
      startDate: string;
      endDate: string | null;
    }>,
  ) {
    const db = getDb();
    const [trip] = await db
      .update(trips)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, id))
      .returning();

    return trip ?? null;
  }

  async updatePublicReport(
    id: string,
    payload: {
      publicReportEnabled: boolean;
      publicReportToken: string | null;
    },
  ) {
    const db = getDb();
    const [trip] = await db
      .update(trips)
      .set({
        publicReportEnabled: payload.publicReportEnabled,
        publicReportToken: payload.publicReportToken,
        updatedAt: new Date(),
      })
      .where(eq(trips.id, id))
      .returning();

    return trip ?? null;
  }

  async delete(id: string) {
    const db = getDb();
    const [trip] = await db.delete(trips).where(eq(trips.id, id)).returning();
    return trip ?? null;
  }
}

export const tripRepository = new TripRepository();
