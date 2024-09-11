"use server";
import { createClient } from "@/lib/utils/supabase-service-role";
import db from "../db";
import { revalidatePath } from "next/cache";
import {
  UserData,
  addUser,
  addUsers,
  getUsersByRole,
} from "../users/mutations";
import { studentTypes, students, users } from "../schema";
import { getCurrentSession } from "@/lib/utils/get-current-session-server";
import { eq, sql } from "drizzle-orm";

// NOTE: This goes in the queries file
export async function getAllStudents() {
  let query2 = db
    .select()
    .from(users)
    .innerJoin(students, eq(users.id, students.id))
    .where(eq(users.role, "student"))
    .prepare("get-all-students");

  const mutation = await query2.execute();

  return mutation;
}

export async function getStudentsTypes() {
  let query = db
    .select()
    .from(studentTypes)
    .prepare("get-all-types-of-students");

  const mutation = await query.execute();

  return mutation;
}

export async function getStudentById(studentId: string) {
  let userQuery = db
    .select()
    .from(users)
    .where(eq(users.id, sql.placeholder("studentId")))
    .prepare("get-student-info");

  let studentQuery = db
    .select()
    .from(students)
    .where(eq(students.id, sql.placeholder("studentId")))
    .prepare("get-student-details");

  try {
    const [userData, studentData] = await Promise.all([
      userQuery.execute({ studentId }),
      studentQuery.execute({ studentId }),
    ]);

    const studentInfo = {
      id: userData[0].id,
      email: userData[0].email,
      first_name: userData[0].firstName,
      last_name: userData[0].lastName,
      dob: userData[0].birthDate,
      githubAccount: userData[0].githubUser,
      gitlabAccount: userData[0].gitlabUser,
      studentNumber: studentData[0].studentNumber,
      studentType: studentData[0].studentType,
      status: studentData[0].status,
      createdOn: studentData[0].createdOn,
      createdBy: studentData[0].createdBy,
      validatedOn: studentData[0].validatedOn,
      validatedBy: studentData[0].validatedBy,
      mobilePhone: userData[0].mobilePhone,
      photo: studentData[0].photo,
    };
    console.log("--------" + studentInfo.status);

    return studentInfo;
  } catch (error) {
    console.error("Error fetching student details:", error);
    throw error;
  }
}

export async function addStudent(
  email: string,
  first_name: string,
  last_name: string,
  password: string,
  githubAccount: string | undefined,
  gitlabAccount: string | undefined,
  dob: Date,
  studentNumber: string,
  studentType: string,
  studentStatus: string,
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
    "student",
    dob.toISOString(),
    githubAccount ?? null,
    gitlabAccount ?? null,
    otherEmail ?? null,
    mobilePhone
  );

  let user_id = response.data.user?.id;
  const currentUser = getCurrentSession();
  const creatorId = (await currentUser).data.user?.id;

  let query_type = db
    .select()
    .from(studentTypes)
    .where(eq(studentTypes.name, sql.placeholder("studentType")))
    .prepare("get-uuid-by-student-type");

  const mutation_type = await query_type.execute({
    studentType,
  });

  const prepared = db
    .insert(students)
    .values({
      id: sql.placeholder("id"),
      studentNumber: sql.placeholder("studentNumber"),
      studentType: sql.placeholder("studentType"),
      status: sql.placeholder("status"),
      createdOn: sql.placeholder("createdOn"),
      createdBy: sql.placeholder("createdBy"),
      validatedOn: sql.placeholder("validatedOn"),
      validatedBy: sql.placeholder("validatedBy"),
    })
    .prepare("add-student-to-db");

  const mutation = await prepared.execute({
    id: user_id,
    studentNumber: studentNumber,
    studentType: mutation_type[0].id,
    status: studentStatus,
    createdOn: new Date().toISOString(),
    createdBy: creatorId,
    validatedOn: new Date().toISOString(),
    validatedBy: creatorId,
  });

  if (response.error) {
    return { error: { message: response.error.message } };
  }

  revalidatePath("/");

  return { data: { user: response.data.user } };
}

export type StudentData = UserData & {
  password: string;
  studentNumber: number;
  studentType: string;
  studentStatus: string;
};
export async function addStudents(studentCSV: StudentData[]) {
  const supabase = createClient();

  let validated: StudentData[] = [];
  let errors: string[] = [];

  for (const student of studentCSV) {
    student.role = "student";
    try {
      const response = await supabase.auth.admin.createUser({
        email: student.email,
        password: student.password,
        email_confirm: true,
      });
      console.log(response);
      if (response.error != null) {
        throw new Error(
          `Error Adding Student: ${student.firstName} ${student.lastName}`
        );
      }
      student.id = response.data.user.id;
      validated.push(student);
    } catch (e) {
      errors.push((e as Error).message);
    }
  }

  if (validated.length > 0) {
    const result = await addUsers(validated);
    if (!result?.success) {
      return {
        error: result?.error,
        data: null,
      };
    }

    const currentUser = await getCurrentSession();
    const creatorId = currentUser.data.user?.id;

    for (const student of validated) {
      try {
        let query_type = db
          .select()
          .from(studentTypes)
          .where(eq(studentTypes.name, sql.placeholder("studentType")))
          .prepare("get-uuid-by-student-type");

        const mutation_type = await query_type.execute({
          studentType: student.studentType,
        });

        const prepared = db
          .insert(students)
          .values({
            id: sql.placeholder("id"),
            studentNumber: sql.placeholder("studentNumber"),
            studentType: sql.placeholder("studentType"),
            status: sql.placeholder("status"),
            createdOn: sql.placeholder("createdOn"),
            createdBy: sql.placeholder("createdBy"),
            validatedOn: sql.placeholder("validatedOn"),
            validatedBy: sql.placeholder("validatedBy"),
          })
          .prepare("add-student-to-db");

        await prepared.execute({
          id: student.id,
          studentNumber: student.studentNumber,
          studentType: mutation_type[0].id,
          status: student.studentStatus,
          createdOn: new Date().toISOString(),
          createdBy: creatorId,
          validatedOn: new Date().toISOString(),
          validatedBy: creatorId,
        });
      } catch (e) {
        errors.push(
          `Error adding student data: ${student.firstName} ${student.lastName}`
        );
      }
    }
  }

  revalidatePath("/");

  if (validated.length <= 0 && errors.length > 0) {
    return {
      error: "Failed to add any students. Please check error log.",
      data: null,
    };
  }

  return { data: validated, error: errors.length > 0 ? errors : null };
}

export async function updateStudentById(
  studentId: string,
  updatedStudentData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    dob?: Date;
    githubAccount?: string;
    gitlabAccount?: string;
    studentNumber?: string;
    studentType?: string;
    studentStatus?: string;
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
        email: updatedStudentData.email,
        firstName: updatedStudentData.firstName,
        lastName: updatedStudentData.lastName,
        birthDate: updatedStudentData.dob?.toISOString(),
        githubUser: updatedStudentData.githubAccount,
        gitlabUser: updatedStudentData.gitlabAccount,
        mobilePhone: updatedStudentData.mobilePhone,
        otherEmail: updatedStudentData.otherEmail,
      })
      .where(eq(users.id, sql.placeholder("studentId")))
      .prepare("update-student-user-info")
      .execute({ studentId });

    // Retrieve the UUID for the student type
    const queryType = db
      .select()
      .from(studentTypes)
      .where(eq(studentTypes.name, sql.placeholder("studentType")))
      .prepare("get-uuid-by-student-type");

    const mutationType = await queryType.execute({
      studentType: updatedStudentData.studentType,
    });

    // Update student information
    await db
      .update(students)
      .set({
        studentNumber: updatedStudentData.studentNumber,
        studentType: mutationType[0]?.id,
        status: updatedStudentData.studentStatus,
      })
      .where(eq(students.id, sql.placeholder("studentId")))
      .prepare("update-student-details")
      .execute({ studentId });

    const supabase = createClient();

    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      studentId,
      {
        email: updatedStudentData.email,
      }
    );

    // Check if a new password is provided
    if (updatedStudentData.password) {
      // Update authentication password using Supabase Auth API
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        studentId,
        {
          password: updatedStudentData.password,
        }
      );

      if (passwordError) {
        // Return error if password update fails
        return { error: { message: "Failed to update teacher password." } };
      }
    }

    return { error: null };
  } catch (error) {
    console.error("Error updating student:", error);
    return { error: { message: "Failed to update student details." } };
  }
}
