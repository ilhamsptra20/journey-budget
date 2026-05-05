import { eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { consumptionItems } from "@/infrastructure/db/schema";

class ConsumptionItemRepository {
  async findAll() {
    const db = getDb();
    return db.select().from(consumptionItems);
  }

  async findById(id: string) {
    const db = getDb();
    const [row] = await db
      .select()
      .from(consumptionItems)
      .where(eq(consumptionItems.id, id))
      .limit(1);

    return row ?? null;
  }

  async create(payload: {
    title: string;
    category: "makan_berat" | "makanan_ringan" | "minuman" | "bumbu" | "other";
    unit: string;
    defaultPrice?: number | null;
  }) {
    const db = getDb();
    const [row] = await db
      .insert(consumptionItems)
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
      category: "makan_berat" | "makanan_ringan" | "minuman" | "bumbu" | "other";
      unit: string;
      defaultPrice: number | null;
    }>,
  ) {
    const db = getDb();
    const [row] = await db
      .update(consumptionItems)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(consumptionItems.id, id))
      .returning();

    return row ?? null;
  }

  async delete(id: string) {
    const db = getDb();
    const [row] = await db
      .delete(consumptionItems)
      .where(eq(consumptionItems.id, id))
      .returning();

    return row ?? null;
  }
}

export const consumptionItemRepository = new ConsumptionItemRepository();
