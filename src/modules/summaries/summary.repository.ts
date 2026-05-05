import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import {
  expenseParticipants,
  funds,
  members,
  tripAccommodations,
  tripConsumptions,
  tripLogistics,
  tripMembers,
  trips,
} from "@/infrastructure/db/schema";

class SummaryRepository {
  async getTripById(tripId: string) {
    const db = getDb();
    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
    return trip ?? null;
  }

  async getTripMembers(tripId: string) {
    const db = getDb();
    return db
      .select({
        member_id: members.id,
        name: members.name,
      })
      .from(tripMembers)
      .innerJoin(members, eq(tripMembers.memberId, members.id))
      .where(eq(tripMembers.tripId, tripId));
  }

  async getTripLogistics(tripId: string) {
    const db = getDb();
    return db.select().from(tripLogistics).where(eq(tripLogistics.tripId, tripId));
  }

  async getTripConsumptions(tripId: string) {
    const db = getDb();
    return db.select().from(tripConsumptions).where(eq(tripConsumptions.tripId, tripId));
  }

  async getTripAccommodations(tripId: string) {
    const db = getDb();
    return db.select().from(tripAccommodations).where(eq(tripAccommodations.tripId, tripId));
  }

  async getFunds(tripId: string) {
    const db = getDb();
    return db.select().from(funds).where(eq(funds.tripId, tripId));
  }

  async getExpenseParticipants(expenseType: "trip_logistics" | "trip_consumptions" | "trip_accommodations", expenseIds: string[]) {
    if (expenseIds.length === 0) {
      return [];
    }

    const db = getDb();
    return db
      .select({
        expense_type: expenseParticipants.expenseType,
        expense_id: expenseParticipants.expenseId,
        member_id: expenseParticipants.memberId,
      })
      .from(expenseParticipants)
      .where(
        and(
          eq(expenseParticipants.expenseType, expenseType),
          inArray(expenseParticipants.expenseId, expenseIds),
        ),
      );
  }
}

export const summaryRepository = new SummaryRepository();
