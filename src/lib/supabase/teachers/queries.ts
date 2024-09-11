"use server";
import db from "../db";
import { revalidatePath } from "next/cache";
import { addUser, getUsersByRole } from "../users/mutations";
import { programs } from "../schema";
import { eq, sql } from "drizzle-orm";

export async function getAllPrograms() {
  let query2 = db.select().from(programs).prepare("get-all-programs");

  const queries = await query2.execute();

  return queries;
}
