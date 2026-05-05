import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const createTypedDb = (client: postgres.Sql) => drizzle(client, { schema });
type DbClient = ReturnType<typeof createTypedDb>;

let database: DbClient | null = null;

function createDb(): DbClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }

  const client = postgres(url, {
    ssl: "require",
    prepare: false,
    max: 1,
  });

  return createTypedDb(client);
}

export function getDb() {
  if (!database) {
    database = createDb();
  }

  return database;
}

export { schema };
