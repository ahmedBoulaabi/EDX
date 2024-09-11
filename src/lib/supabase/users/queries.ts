"use server";
import db from "../db";
import { revalidatePath } from "next/cache";
import { users, students, courses, enrollmentPrograms } from "../schema";
import { eq, sql } from "drizzle-orm";

export async function getUserData(user_id: string) {
  const prepared = db
    .select()
    .from(users)
    .where(eq(users.id, sql.placeholder("user_id")))
    .limit(1)
    .prepare("get-user-data");

  const query = await prepared.execute({
    user_id,
  });

  return query[0];
}

export async function getTotalUsersCount() {
  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(sql`role != 'admin'`)
    .prepare("get-total-users-count")
    .execute();
  return Number(result[0]?.count ?? 0);
}

export async function getTotalStudentsCount() {
  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(sql`role = 'student'`)
    .prepare("get-total-students-count")
    .execute();
  return Number(result[0]?.count ?? 0);
}

export async function getTotalTeachersCount() {
  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(sql`role = 'teacher'`)
    .prepare("get-total-teachers-count")
    .execute();
  return Number(result[0]?.count ?? 0);
}

export async function getTotalCapacity() {
  const totalCapacity = 4145;
  return totalCapacity;
}

export async function getEnrolledStudentsCount() {
  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(students)
    .where(sql`program_id IS NOT NULL`)
    .execute();
  return Number(result[0]?.count ?? 0);
}

export async function getTotalCoursesCount() {
  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(courses)
    .execute();
  return Number(result[0]?.count ?? 0);
}

export async function getTotalEnrollmentRequestsCount() {
  const result = await db
    .select({ count: sql`COUNT(*)` })
    .from(enrollmentPrograms)
    .execute();
  return Number(result[0]?.count ?? 0);
}
