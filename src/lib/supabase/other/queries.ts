"use server";
import { eq, sql } from "drizzle-orm";
import db from "../db";
import {
  buildings,
  classrooms,
  courses,
  programs,
  roomPlans,
  schoolyears,
  studentTypes,
  users,
  students,
  enrollmentPrograms,
  groups,
  mainRepositories,
  forkedRepositories,
} from "../schema";

export async function getAllPrograms() {
  const prepared = await db.select().from(programs).prepare("get-all-programs");
  const query = await prepared.execute({});
  return query;
}

export async function getEnrollmentRequests() {
  try {
    const enrollmentRequestsQuery = db
      .select()
      .from(enrollmentPrograms)
      .innerJoin(students, eq(enrollmentPrograms.studentId, students.id))
      .innerJoin(programs, eq(enrollmentPrograms.programId, programs.id))
      .innerJoin(users, eq(enrollmentPrograms.studentId, users.id))
      .prepare("get-enrollment-requests");

    const enrollmentRequests = await enrollmentRequestsQuery.execute();

    const structuredEnrollmentRequests = enrollmentRequests.map((request) => ({
      enrollmentRequestId: request.enrollment_programs.id,
      student: {
        id: request.students.id,
        name: request.users.lastName + " " + request.users.firstName,
        email: request.users.email,
      },
      program: {
        id: request.programs.id,
        name: request.programs.name,
      },
      state: request.enrollment_programs.state,
      note: request.enrollment_programs.note,
      requestDate: request.enrollment_programs.requestDate,
    }));

    return { data: structuredEnrollmentRequests, error: null };
  } catch (error) {
    console.error("Error fetching enrollment requests:", error);
    return { error: { message: "Failed to fetch enrollment requests." } };
  }
}

export async function getEnrollmentRequestById(request_id: string) {
  if (!request_id) return;
  try {
    const enrollmentRequestsQuery = db
      .select()
      .from(enrollmentPrograms)
      .where(eq(enrollmentPrograms.id, sql.placeholder("request_id")))
      .innerJoin(students, eq(enrollmentPrograms.studentId, students.id))
      .innerJoin(programs, eq(enrollmentPrograms.programId, programs.id))
      .innerJoin(users, eq(enrollmentPrograms.studentId, users.id))
      .prepare("get-enrollment-request");

    const enrollmentRequests = await enrollmentRequestsQuery.execute({
      request_id: request_id,
    });

    if (enrollmentRequests.length === 0) {
      return { data: null, error: { message: "No enrollment request found." } };
    }

    const request = enrollmentRequests[0];

    const structuredEnrollmentRequest = {
      enrollmentRequestId: request.enrollment_programs.id,
      student: {
        id: request.students.id,
        name: request.users.lastName + " " + request.users.firstName,
        email: request.users.email,
      },
      program: {
        id: request.programs.id,
        name: request.programs.name,
      },
      state: request.enrollment_programs.state,
      note: request.enrollment_programs.note,
      requestDate: request.enrollment_programs.requestDate,
    };

    return { data: structuredEnrollmentRequest, error: null };
  } catch (error) {
    console.error("Error fetching enrollment request:", error);
    return { error: { message: "Failed to fetch enrollment request." } };
  }
}

export async function getAllStudentTypes() {
  const prepared = db
    .select()
    .from(studentTypes)
    .prepare("get-all-student-types");
  const query = await prepared.execute({});
  return query;
}

export async function getAllCourses() {
  const prepared = await db
    .select()
    .from(courses)
    .innerJoin(users, eq(courses.instructor, users.id))
    .prepare("get-all-courses");
  const query = await prepared.execute({});
  return query;
}

export async function getAllSchoolYears() {
  const prepared = db
    .select()
    .from(schoolyears)
    .prepare("get-all-school-years");
  const query = await prepared.execute({});
  return query;
}

export async function getAllClassrooms() {
  const prepared = db
    .select()
    .from(classrooms)
    .innerJoin(roomPlans, eq(classrooms.roomPlanId, roomPlans.id))
    .innerJoin(buildings, eq(classrooms.buildingId, buildings.id))
    .prepare("get-all-classrooms");
  const query = await prepared.execute({});

  return query;
}

export async function getAllBuildings() {
  const prepared = db.select().from(buildings).prepare("get-all-buildings");
  const query = await prepared.execute({});
  return query;
}

export async function getAllRoomPlans() {
  const prepared = db.select().from(roomPlans).prepare("get-all-room-plans");
  const query = await prepared.execute({});
  return query;
}

export async function getAllGroups() {
  const prepared = await db.select().from(groups).prepare("get-all-groups");
  const query = await prepared.execute({});
  return query;
}
export type StudentInfo = {
  studentRepoName: String;
  student: {
    id: string;
    name: string;
    email: string;
    studentGithub: string | null;
  };
};

type MainRepositoryInfo = {
  mainRepositoryId: string;
  mainRepositoryName: string;
  mainRepositoryStatus: string;
  mainRepositoriesCreatedAt: Date;
  students: StudentInfo[];
};

export async function getMainRepositoriesWithStudentInfo() {
  try {
    const mainRepositoriesQuery = db
      .select()
      .from(mainRepositories)
      .innerJoin(
        forkedRepositories,
        eq(forkedRepositories.mainRepoId, mainRepositories.id)
      )
      .innerJoin(students, eq(forkedRepositories.studentId, students.id))
      .innerJoin(users, eq(students.id, users.id))
      .prepare("get-main-repositories-with-student-info");

    const mainRepositoriesWithStudentInfo =
      await mainRepositoriesQuery.execute();

    const structuredData: MainRepositoryInfo[] =
      mainRepositoriesWithStudentInfo.reduce(
        (acc: MainRepositoryInfo[], entry) => {
          const mainRepo = acc.find(
            (repo) => repo.mainRepositoryId === entry.main_repositories.id
          );

          const studentInfo: StudentInfo = {
            studentRepoName: entry.forked_repositories.repoName,
            student: {
              id: entry.students.id,
              name: entry.users.lastName + " " + entry.users.firstName,
              email: entry.users.email,
              studentGithub: entry.users.githubUser,
            },
          };

          if (mainRepo) {
            mainRepo.students.push(studentInfo);
          } else {
            acc.push({
              mainRepositoryId: entry.main_repositories.id,
              mainRepositoryName: entry.main_repositories.name,
              mainRepositoryStatus: entry.main_repositories.status,
              mainRepositoriesCreatedAt: entry.main_repositories.createdAt,
              students: [studentInfo],
            });
          }

          return acc;
        },
        []
      );

    return { data: structuredData, error: null };
  } catch (error) {
    console.error("Error fetching main repositories with student info:", error);
    return {
      error: {
        message: "Failed to fetch main repositories with student info.",
      },
    };
  }
}
