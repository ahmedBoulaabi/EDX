"use server";
import { createClient } from "@/lib/utils/supabase-service-role";
import db from "../db";
import { revalidatePath } from "next/cache";
import { addUser, getUsersByRole } from "../users/mutations";
import { users, teachers } from "../schema";
import { eq, sql } from "drizzle-orm";

// NOTE: This goes in the queries file
export async function getAllTeachers() {
  let query2 = db
    .select()
    .from(users)
    .innerJoin(teachers, eq(users.id, teachers.id))
    .where(eq(users.role, "teacher"))
    .prepare("get-all-teachers");

  const mutation = await query2.execute();

  return mutation;
}

export async function getTeacherById(teacherId: string | null) {
  let userQuery = db
    .select()
    .from(users)
    .where(eq(users.id, sql.placeholder("teacherId")))
    .prepare("get-teacher-info");

  let teacherQuery = db
    .select()
    .from(teachers)
    .where(eq(teachers.id, sql.placeholder("teacherId")))
    .prepare("get-teacher-details");

  try {
    const [userData, teacherData] = await Promise.all([
      userQuery.execute({ teacherId }),
      teacherQuery.execute({ teacherId }),
    ]);

    const teacherInfo = {
      id: userData[0].id,
      email: userData[0].email,
      first_name: userData[0].firstName,
      last_name: userData[0].lastName,
      dob: userData[0].birthDate,
      githubAccount: userData[0].githubUser,
      gitlabAccount: userData[0].gitlabUser,
      isInternal: teacherData[0].isInternal,
    };

    return teacherInfo;
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    throw error;
  }
}

export async function addTeacher(
  email: string,
  first_name: string,
  last_name: string,
  password: string,
  githubAccount: string | undefined,
  gitlabAccount: string | undefined,
  dob: Date,
  isInternal: boolean,
  mobilePhone: string,
  otherEmail: string | undefined
) {
  const supabase = createClient();

  const response = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    // options: {
    //   emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}api/auth/callback`,
    // },
  });

  const createEntryInUsersTable = await addUser(
    response.data.user?.id,
    email,
    first_name,
    last_name,
    "teacher",
    dob.toISOString(),
    githubAccount ?? null,
    gitlabAccount ?? null,
    otherEmail ?? null,
    mobilePhone
  );

  let user_id = response.data.user?.id;

  const prepared = db
    .insert(teachers)
    .values({
      id: user_id,
      isInternal: isInternal,
    })
    .prepare("add-teacher-to-db");

  const mutation = await prepared.execute();

  if (response.error) {
    return { error: { message: response.error.message } };
  }

  revalidatePath("/");

  return { data: { user: response.data.user } };
}

export async function updateTeacherById(
  teacherId: string,
  updatedTeacherData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    dob?: Date;
    githubAccount?: string;
    gitlabAccount?: string;
    isInternal: boolean;
    mobilePhone: string;
    otherEmail: string | undefined;
    password: string | undefined;
  }
) {
  try {
    // Update user information
    await db
      .update(users)
      .set({
        email: updatedTeacherData.email,
        firstName: updatedTeacherData.firstName,
        lastName: updatedTeacherData.lastName,
        birthDate: updatedTeacherData.dob?.toISOString(),
        githubUser: updatedTeacherData.githubAccount,
        gitlabUser: updatedTeacherData.gitlabAccount,
        mobilePhone: updatedTeacherData.mobilePhone,
        otherEmail: updatedTeacherData.otherEmail,
      })
      .where(eq(users.id, sql.placeholder("teacherId")))
      .prepare("update-teacher-user-info")
      .execute({ teacherId });

    // Update student information
    await db
      .update(teachers)
      .set({
        isInternal: updatedTeacherData.isInternal,
      })
      .where(eq(teachers.id, sql.placeholder("teacherId")))
      .prepare("update-teacher-details")
      .execute({ teacherId });

    const supabase = createClient();

    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      teacherId,
      {
        email: updatedTeacherData.email,
      }
    );

    if (updatedTeacherData.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        teacherId,
        {
          password: updatedTeacherData.password,
        }
      );

      if (passwordError) {
        return { error: { message: "Failed to update teacher password." } };
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Error updating student:", error);
    return { error: { message: "Failed to update teacher details." } };
  }
}
