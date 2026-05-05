import { eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { members } from "@/infrastructure/db/schema";

class MemberRepository {
  async findAll() {
    const db = getDb();
    return db.select().from(members);
  }

  async findById(id: string) {
    const db = getDb();
    const [member] = await db.select().from(members).where(eq(members.id, id)).limit(1);
    return member ?? null;
  }

  async create(name: string) {
    const db = getDb();
    const [member] = await db.insert(members).values({ name }).returning();
    return member;
  }

  async update(id: string, payload: Partial<{ name: string }>) {
    const db = getDb();
    const [member] = await db
      .update(members)
      .set({
        ...payload,
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning();

    return member ?? null;
  }

  async delete(id: string) {
    const db = getDb();
    const [member] = await db.delete(members).where(eq(members.id, id)).returning();
    return member ?? null;
  }
}

export const memberRepository = new MemberRepository();
