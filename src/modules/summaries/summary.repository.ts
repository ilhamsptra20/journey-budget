import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import {
  accommodationItems,
  expenseParticipants,
  funds,
  logisticItems,
  members,
  consumptionItems,
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

  async getPublicTripByToken(token: string) {
    const db = getDb();
    const [trip] = await db
      .select()
      .from(trips)
      .where(
        and(
          eq(trips.publicReportToken, token),
          eq(trips.publicReportEnabled, true),
        ),
      )
      .limit(1);
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

  async getPublicLogisticsBreakdown(tripId: string) {
    const db = getDb();
    return db
      .select({
        title: logisticItems.title,
        unit: logisticItems.unit,
        acquisitionType: tripLogistics.acquisitionType,
        scope: tripLogistics.scope,
        costType: tripLogistics.costType,
        price: tripLogistics.price,
        count: tripLogistics.count,
        duration: tripLogistics.duration,
      })
      .from(tripLogistics)
      .innerJoin(logisticItems, eq(tripLogistics.logisticItemId, logisticItems.id))
      .where(eq(tripLogistics.tripId, tripId));
  }

  async getPublicConsumptionsBreakdown(tripId: string) {
    const db = getDb();
    return db
      .select({
        title: consumptionItems.title,
        category: consumptionItems.category,
        unit: consumptionItems.unit,
        time: tripConsumptions.time,
        scope: tripConsumptions.scope,
        price: tripConsumptions.price,
        count: tripConsumptions.count,
      })
      .from(tripConsumptions)
      .innerJoin(consumptionItems, eq(tripConsumptions.consumptionItemId, consumptionItems.id))
      .where(eq(tripConsumptions.tripId, tripId));
  }

  async getPublicAccommodationsBreakdown(tripId: string) {
    const db = getDb();
    return db
      .select({
        title: accommodationItems.title,
        category: accommodationItems.category,
        unit: accommodationItems.unit,
        scope: tripAccommodations.scope,
        price: tripAccommodations.price,
        count: tripAccommodations.count,
      })
      .from(tripAccommodations)
      .innerJoin(
        accommodationItems,
        eq(tripAccommodations.accommodationItemId, accommodationItems.id),
      )
      .where(eq(tripAccommodations.tripId, tripId));
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
