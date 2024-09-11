"use server";
import db from "../db";
import { users } from "../schema";
import { eq, ne, sql } from "drizzle-orm";
import { createClient } from "@/lib/utils/supabase-service-role";

export type UserData = typeof users.$inferInsert;

export async function addUser(
  user_id: string | undefined,
  email: string,
  first_name: string,
  last_name: string,
  role: UserRole,
  dob: string | null,
  githubAccount: string | null,
  gitlabAccount: string | null,
  otherEmail: string | null,
  mobilePhone: string
) {
  if (!user_id) return;

  const prepared = db
    .insert(users)
    .values({
      id: sql.placeholder("user_id"),
      email: sql.placeholder("email"),
      firstName: sql.placeholder("first_name"),
      lastName: sql.placeholder("last_name"),
      role: sql.placeholder("role"),
      githubUser: sql.placeholder("githubAccount"),
      gitlabUser: sql.placeholder("gitlabAccount"),
      birthDate: sql.placeholder("dob"),
      otherEmail: sql.placeholder("otherEmail"),
      mobilePhone: sql.placeholder("mobilePhone"),
    })
    .prepare("add-user-to-db");

  const mutation = await prepared.execute({
    user_id,
    first_name,
    last_name,
    email,
    role,
    dob,
    githubAccount,
    gitlabAccount,
    mobilePhone,
    otherEmail,
  });

  return mutation;
}

export async function addUsers(persons: UserData[]) {
  if (persons.length <= 0) return { success: true, data: [] };

  try {
    const mutation = db.insert(users).values(persons);
    await mutation;
    return { success: true, data: persons };
  } catch (error: unknown) {
    console.error("Failed to add users:", error);

    if (error instanceof Error && "detail" in error) {
      const detail: string = (error as any).detail;
      if (detail.includes("already exists")) {
        return { success: false, error: `Duplicate entry found: ${detail}` };
      }
    }

    return { success: false, error: "An unknown error occurred" };
  }
}

// NOTE: This goes in the queries not mutations
export async function getUsersByRole(role: UserRole | undefined) {
  let query = db
    .select()
    .from(users)
    .where(ne(users.role, "admin"))
    .prepare("get-all-users-but-no-admins");

  if (role) {
    query = db
      .select()
      .from(users)
      .where(eq(users.role, sql.placeholder("role")))
      .prepare("get-users-by-role");
  }

  const mutation = await query.execute({
    role,
  });

  return mutation;
}

async function deleteUserById(user_id: string) {
  let query = db
    .delete(users)
    .where(eq(users.id, sql.placeholder("user_id")))
    .prepare("delete-user-by-id");

  const mutation = await query.execute({
    user_id,
  });

  return mutation;
}

async function deleteUserFromAuth(user_id: string) {
  const supabase = createClient();

  const response = await supabase.auth.admin.deleteUser(user_id);

  return response;
}

export async function deleteUserByIdFromBoth(user_id: string) {
  const dbDeletion = await deleteUserById(user_id);

  const response = await deleteUserFromAuth(user_id);

  if (response.error) {
    return { error: { message: response.error.message } };
  }

  return { error: null };
}
