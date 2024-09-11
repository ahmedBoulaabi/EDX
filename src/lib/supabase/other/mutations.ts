"use server";
import { eq, sql, and } from "drizzle-orm";
import db from "../db";
import {
  courses,
  groups,
  programs,
  schoolyears,
  studentTypes,
  coursePrograms as course_programs,
  enrollmentPrograms,
  students,
  CourseType,
  mainRepositories,
  forkedRepositories,
} from "../schema";
import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/utils/get-current-session-server";
import { Octokit } from "@octokit/rest";

export async function AddEnrollmentRequest(program_id: string) {
  try {
    const currentUser = await getCurrentSession();
    const senderId = currentUser.data.user?.id;

    let checkRequestQuery = db
      .select()
      .from(enrollmentPrograms)
      .where(
        and(
          eq(enrollmentPrograms.studentId, sql.placeholder("studentId")),
          eq(enrollmentPrograms.programId, sql.placeholder("programId")),
          eq(enrollmentPrograms.state, "pending")
        )
      )
      .prepare("check-existing-pending-request");

    const existingRequest = await checkRequestQuery.execute({
      studentId: senderId,
      programId: program_id,
    });

    if (existingRequest.length > 0) {
      return {
        error: {
          message:
            "An enrollment request with the same program is already pending.",
        },
      };
    }

    let insertRequestQuery = db
      .insert(enrollmentPrograms)
      .values({
        studentId: sql.placeholder("studentId"),
        programId: sql.placeholder("programId"),
      })
      .prepare("add-program-to-db");

    await insertRequestQuery.execute({
      studentId: senderId,
      programId: program_id,
    });

    revalidatePath("/");

    return { error: null };
  } catch (error) {
    console.error("Error sending enrollment request:", error);
    return { error: { message: "Failed to send enrollment request." } };
  }
}
export async function addProgram(name: string) {
  try {
    const prepared = db
      .insert(programs)
      .values({
        name: name,
      })
      .prepare("add-program-to-db");

    const mutation = await prepared.execute();

    const resp = await addGroup(name);

    revalidatePath("/");

    return { error: null };
  } catch (error) {
    console.error("Error adding program:", error);
    return { error: { message: "Failed to add program." } };
  }
}

export async function addGroup(name: string) {
  try {
    const prepared = db
      .insert(groups)
      .values({
        name: name,
      })
      .prepare("add-group-to-db");

    const mutation = await prepared.execute();

    revalidatePath("/");

    return { error: null };
  } catch (error) {
    console.error("Error adding group:", error);
    return { error: { message: "Failed to add group." } };
  }
}

export async function addCourse(
  name: string,
  instructor: string,
  courseType: (typeof CourseType.enumValues)[number],
  programs: Array<{ id: string; name: string }>
) {
  try {
    const courseInsertQuery = await db
      .insert(courses)
      .values({
        name: name,
        courseType: courseType,
        instructor: instructor,
      })
      .returning({ id: courses.id })
      .execute();

    const courseIds = await courseInsertQuery[0].id;

    const courseProgramsInsertQuery = await db
      .insert(course_programs)
      .values(
        programs.map((program) => ({
          programId: program.id,
          courseId: courseIds,
        }))
      )
      .execute();

    revalidatePath("/");

    return { error: null };
  } catch (error) {
    console.error("Error adding course:", error);
    return { error: { message: "Failed to add course." } };
  }
}

export async function addStudentType(name: string) {
  try {
    const prepared = db
      .insert(studentTypes)
      .values({
        name: name,
      })
      .prepare("add-student-type-to-db");

    const mutation = await prepared.execute();

    revalidatePath("/");

    return { error: null };
  } catch (error) {
    console.error("Error adding student type:", error);
    return { error: { message: "Failed to add student type." } };
  }
}

type date = { name: string; start: Date; end: Date; is_visible: boolean };

export async function addSchoolYear(data: date) {
  try {
    const prepared = db
      .insert(schoolyears)
      .values({
        name: data.name,
        begin: data.start.toISOString(),
        end: data.end.toISOString(),
        isVisible: data.is_visible,
      })
      .prepare("add-school-year-to-db");

    const mutation = await prepared.execute();

    revalidatePath("/");

    return { error: null };
  } catch (error) {
    console.error("Error adding school year:", error);
    return { error: { message: "Failed to add school year." } };
  }
}

export async function deleteProgramById(
  program_id: string,
  group_name: string
) {
  try {
    let query = db
      .delete(programs)
      .where(eq(programs.id, sql.placeholder("program_id")))
      .prepare("delete-program-by-id");

    const mutation = await query.execute({
      program_id,
    });
    if (group_name) {
      const resp = await deleteGroupByName(group_name);
    }

    return { error: null };
  } catch (error) {
    console.error("Error deleting program:", error);
    return { error: { message: "Failed to delete program." } };
  }
}

export async function deleteGroupByName(group_name: string) {
  try {
    let query = db
      .delete(groups)
      .where(eq(groups.name, sql.placeholder("group_name")))
      .prepare("delete-group-by-name");

    const mutation = await query.execute({
      group_name,
    });

    return { error: null };
  } catch (error) {
    console.error("Error deleting group:", error);
    return { error: { message: "Failed to delete group." } };
  }
}

export async function deleteCourseById(course_id: string) {
  try {
    let query = db
      .delete(courses)
      .where(eq(courses.id, sql.placeholder("course_id")))
      .prepare("delete-course-by-id");

    const mutation = await query.execute({
      course_id,
    });

    return { error: null };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { error: { message: "Failed to delete course." } };
  }
}

export async function deleteEnrollmentById(enrollment_id: string) {
  try {
    let query = db
      .delete(enrollmentPrograms)
      .where(eq(enrollmentPrograms.id, sql.placeholder("enrollment_id")))
      .prepare("delete-enrollment-by-id");

    const mutation = await query.execute({
      enrollment_id,
    });

    return { error: null };
  } catch (error) {
    console.error("Error deleting enrollment request:", error);
    return { error: { message: "Failed to delete enrolment request." } };
  }
}

export async function deleteStudentTypeById(type_id: string) {
  try {
    let query = db
      .delete(studentTypes)
      .where(eq(studentTypes.id, sql.placeholder("type_id")))
      .prepare("delete-student-type-by-id");

    const mutation = await query.execute({
      type_id,
    });

    return { error: null };
  } catch (error) {
    console.error("Error deleting student type:", error);
    return { error: { message: "Failed to delete student type." } };
  }
}

export async function deleteSchoolYearById(school_year_id: string) {
  try {
    let query = db
      .delete(schoolyears)
      .where(eq(schoolyears.id, sql.placeholder("school_year_id")))
      .prepare("delete-school-year-by-id");

    const mutation = await query.execute({
      school_year_id,
    });

    return { error: null };
  } catch (error) {
    console.error("Error deleting student type:", error);
    return { error: { message: "Failed to delete student type." } };
  }
}

export async function updateProgramById(
  programId: string,
  name: string | null
) {
  try {
    await db
      .update(programs)
      .set({
        name: name,
      })
      .where(eq(programs.id, sql.placeholder("programId")))
      .prepare("update-program-info")
      .execute({ programId });

    return { error: null };
  } catch (error) {
    console.error("Error updating program:", error);
    return { error: { message: "Failed to update program details." } };
  }
}

export async function updateStudentTypeById(typeId: string, name: string) {
  try {
    await db
      .update(studentTypes)
      .set({
        name: name,
      })
      .where(eq(studentTypes.id, sql.placeholder("typeId")))
      .prepare("update-student-type-info")
      .execute({ typeId });

    return { error: null };
  } catch (error) {
    console.error("Error updating student type:", error);
    return { error: { message: "Failed to update student type details." } };
  }
}

export async function updateSchoolYearById(
  schoolYearId: string,
  name: string,
  start: Date,
  end: Date,
  is_visible: boolean
) {
  try {
    await db
      .update(schoolyears)
      .set({
        name: name,
        begin: start?.toISOString(),
        end: end?.toISOString(),
        isVisible: is_visible,
      })
      .where(eq(schoolyears.id, sql.placeholder("schoolYearId")))
      .prepare("update-school.year-info")
      .execute({ schoolYearId });

    return { error: null };
  } catch (error) {
    console.error("Error updating school year:", error);
    return { error: { message: "Failed to update school year details." } };
  }
}

export async function updateCourseById(
  courseId: string,
  name: string,
  instructor: string
) {
  try {
    await db
      .update(courses)
      .set({
        name: name,
        instructor: instructor,
      })
      .where(eq(courses.id, sql.placeholder("courseId")))
      .prepare("update-course-info")
      .execute({ courseId });

    return { error: null };
  } catch (error) {
    console.error("Error updating course:", error);
    return { error: { message: "Failed to update course details." } };
  }
}

export async function updateStudentRequestStatusById(
  request_id: string,
  state: string,
  note: string,
  student_id: string,
  program_id: string
) {
  try {
    const update = await db
      .update(enrollmentPrograms)
      .set({
        note: note,
        state: state,
      })
      .where(eq(enrollmentPrograms.id, sql.placeholder("request_id")))
      .returning()
      .prepare("update-enrollment-request")
      .execute({ request_id });

    if (state === "accepted") {
      await db
        .update(students)
        .set({
          programId: program_id,
        })
        .where(eq(students.id, sql.placeholder("student_id")))
        .prepare("update-student-program")
        .execute({ student_id });
    }

    return { error: null };
  } catch (error) {
    console.error("Error updating enrollment request:", error);
    return { error: { message: "Failed to update enrollment request." } };
  }
}

// Function to add main repository
export async function addMainRepository(name: string): Promise<string | null> {
  try {
    const insertMainRepoQuery = db
      .insert(mainRepositories)
      .values({
        name: name,
        status: "opened",
      })
      .returning({ id: mainRepositories.id })
      .prepare("add-main-repository-to-db");

    const mainRepoResult = await insertMainRepoQuery.execute();
    return mainRepoResult[0].id;
  } catch (error: any) {
    if (error.code === "23505") {
      // Postgres error code for unique constraint violation
      return null;
    } else {
      return null;
    }
  }
}

// Function to add multiple forked repositories
export async function addForkedRepositories(
  forkedRepositoriesData: Array<{
    mainRepoId: string;
    repoName: string;
    studentId: string;
  }>
): Promise<string | null> {
  try {
    const insertForkedRepoQuery = db
      .insert(forkedRepositories)
      .values(forkedRepositoriesData)
      .prepare("add-forked-repositories-to-db");

    await insertForkedRepoQuery.execute();
    return null;
  } catch (error: any) {
    if (error.code === "23505") {
      return "A repository with the same name already exists.";
    } else {
      return "Failed to add forked repositories.";
    }
  }
}

type StudentInfo = {
  studentRepoName: string;
  student: {
    id: string;
    name: string;
    email: string;
    studentGithub: string | null;
  };
};

export async function deleteMainRepository(mainRepoId: string) {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  const octokit = new Octokit({ auth: token });
  try {
    const forkRepos = await db
      .select()
      .from(forkedRepositories)
      .where(eq(forkedRepositories.mainRepoId, mainRepoId))
      .execute();

    await Promise.all(
      forkRepos.map(async (repo) => {
        await octokit.repos.delete({
          owner: process.env.NEXT_PUBLIC_ORG ?? "",
          repo: repo.repoName,
        });
      })
    );

    await db
      .delete(forkedRepositories)
      .where(eq(forkedRepositories.mainRepoId, mainRepoId))
      .execute();

    await db
      .delete(mainRepositories)
      .where(eq(mainRepositories.id, mainRepoId))
      .execute();

    return { error: null };
  } catch (error) {
    console.error("Error deleting main repository:", error);
    return { error: { message: "Failed to delete main repository." } };
  }
}

export async function updateMainRepositoryStatusById(
  mainRepoId: string,
  status: string
) {
  try {
    await db
      .update(mainRepositories)
      .set({
        status: status,
      })
      .where(eq(mainRepositories.id, sql.placeholder("mainRepoId")))
      .prepare("update-main-repository-status")
      .execute({ mainRepoId });

    return { error: null };
  } catch (error) {
    console.error("Error updating main repository status:", error);
    return { error: { message: "Failed to update main repository status." } };
  }
}
