import { eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { accommodationItems } from "@/infrastructure/db/schema";

class AccommodationItemRepository {
  async findAll() {
    const db = getDb();
    return db.select().from(accommodationItems);
  }

  async findById(id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(accommodationItems)
      .where(eq(accommodationItems.id, id))
      .limit(1);

    return row ?? null;
  }

  async create(payload: {
    title: string;
    category: "transport" | "tiket" | "penginapan" | "simaksi" | "parkir" | "other";
    unit: string;
    defaultPrice?: number | null;
  }) {
    const db = getDb();
    const [row] = await db
      .insert(accommodationItems)
      .values({
        title: payload.title,
        category: payload.category,
        unit: payload.unit,
        defaultPrice: payload.defaultPrice ?? null,
      })
      .returning();

    return row;
  }

  async update(
    id: string,
    payload: Partial<{
      title: string;
      category: "transport" | "tiket" | "penginapan" | "simaksi" | "parkir" | "other";
      unit: string;
      defaultPrice: number | null;
    }>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(accommodationItems)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(accommodationItems.id, id))
      .returning();

    return row ?? null;
  }

  async delete(id: string) {
    const db = getDb();
    const [row] = await db
      .delete(accommodationItems)
      .where(eq(accommodationItems.id, id))
      .returning();

    return row ?? null;
  }
}

export const accommodationItemRepository = new AccommodationItemRepository();
