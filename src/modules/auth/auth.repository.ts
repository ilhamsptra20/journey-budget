import { eq } from "drizzle-orm";

import { getDb } from "@/infrastructure/db";
import { users, type NewUser } from "@/infrastructure/db/schema";

class AuthRepository {
  async findByEmail(email: string) {
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user ?? null;
  }

  async findById(id: string) {
    const db = getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user ?? null;
  }

  async create(payload: NewUser) {
    const db = getDb();
    const [user] = await db.insert(users).values(payload).returning();
    return user;
  }
}

export const authRepository = new AuthRepository();
