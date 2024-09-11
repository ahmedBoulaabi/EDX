import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL as string, {
  prepare: true,
});

const db = drizzle(sql);
export default db;
