import { eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { logisticItems } from "@/infrastructure/db/schema";

class LogisticItemRepository {
  async findAll() {
    const db = getDb();
    return db.select().from(logisticItems);
  }

  async findById(id: string) {
    const db = getDb();
    const [row] = await db.select().from(logisticItems).where(eq(logisticItems.id, id)).limit(1);
    return row ?? null;
  }

  async create(payload: { title: string; unit: string; defaultPrice?: number | null }) {
    const db = getDb();
    const [row] = await db
      .insert(logisticItems)
      .values({
        title: payload.title,
        unit: payload.unit,
        defaultPrice: payload.defaultPrice ?? null,
      })
      .returning();

    return row;
  }

  async update(
    id: string,
    payload: Partial<{ title: string; unit: string; defaultPrice: number | null }>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(logisticItems)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(logisticItems.id, id))
      .returning();

    return row ?? null;
  }

  async delete(id: string) {
    const db = getDb();
    const [row] = await db
      .delete(logisticItems)
      .where(eq(logisticItems.id, id))
      .returning();

    return row ?? null;
  }
}

export const logisticItemRepository = new LogisticItemRepository();
