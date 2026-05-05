import { and, eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { members, tripMembers } from "@/infrastructure/db/schema";

class TripMemberRepository {
  async listByTripId(tripId: string) {
    const db = getDb();
    return db
      .select({
        id: tripMembers.id,
        trip_id: tripMembers.tripId,
        member_id: tripMembers.memberId,
        member_name: members.name,
        created_at: tripMembers.createdAt,
        updated_at: tripMembers.updatedAt,
      })
      .from(tripMembers)
      .innerJoin(members, eq(tripMembers.memberId, members.id))
      .where(eq(tripMembers.tripId, tripId));
  }

  async findByTripAndMember(tripId: string, memberId: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.memberId, memberId)))
      .limit(1);

    return row ?? null;
  }

  async create(tripId: string, memberId: string) {
    const db = getDb();
    const [row] = await db
      .insert(tripMembers)
      .values({
        tripId,
        memberId,
      })
      .returning();

    return row;
  }

  async deleteByTripAndMember(tripId: string, memberId: string) {
    const db = getDb();
    const [row] = await db
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.memberId, memberId)))
      .returning();

    return row ?? null;
  }

  async listMemberIdsByTripId(tripId: string) {
    const db = getDb();
    const rows = await db
      .select({ memberId: tripMembers.memberId })
      .from(tripMembers)
      .where(eq(tripMembers.tripId, tripId));

    return rows.map((row) => row.memberId);
  }
}

export const tripMemberRepository = new TripMemberRepository();
