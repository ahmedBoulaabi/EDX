"use server";
import db from "../db";
import { revalidatePath } from "next/cache";
import {
  classrooms,
  courses,
  groups,
  planRows,
  planSeats,
  roomPlans,
  seanceGroups,
  seances,
  studentGroups,
  studentPresences,
  studentSeatings,
  students,
  users,
} from "../schema";
import { eq, sql } from "drizzle-orm";

export async function getSeanceData(id: string) {
  const prepared = db
    .select()
    .from(seances)
    .innerJoin(seanceGroups, eq(seances.id, seanceGroups.seanceId))
    .innerJoin(groups, eq(groups.id, seanceGroups.groupsId))
    .innerJoin(classrooms, eq(seances.classroomId, classrooms.id))
    .innerJoin(courses, eq(seances.courseId, courses.id))
    .innerJoin(roomPlans, eq(roomPlans.id, classrooms.roomPlanId))
    .innerJoin(planRows, eq(roomPlans.id, planRows.planId))
    .innerJoin(planSeats, eq(planRows.id, planSeats.rowId))
    .innerJoin(studentGroups, eq(studentGroups.groupId, groups.id))
    .innerJoin(students, eq(students.id, studentGroups.studentId))
    .innerJoin(users, eq(students.id, users.id))
    .where(eq(seances.id, sql.placeholder("seance_id")))
    .prepare("get-seance-data");

  const executed = await prepared.execute({
    seance_id: id,
  });

  console.log(executed);

  type Seance = typeof seances.$inferSelect;
  type Groups = typeof groups.$inferSelect;
  type Classrooms = typeof classrooms.$inferSelect;
  type Courses = typeof courses.$inferSelect;
  type PlanRows = typeof planRows.$inferSelect;
  type PlanSeats = typeof planSeats.$inferSelect;
  type Students = typeof students.$inferSelect;
  type Users = typeof users.$inferSelect;

  const rowSeatsMap = new Map<string, PlanSeats[]>();

  // Create a map of rowId to unique plan_seats
  executed.forEach((row) => {
    if (row.plan_seats && row.plan_seats.rowId) {
      if (!rowSeatsMap.has(row.plan_seats.rowId)) {
        rowSeatsMap.set(row.plan_seats.rowId, []);
      }
      const existingSeats = rowSeatsMap.get(row.plan_seats.rowId)!;
      if (!existingSeats.some((seat) => seat.id === row.plan_seats.id)) {
        existingSeats.push(row.plan_seats);
      }
    }
  });

  const result = executed.reduce<{
    seances: Seance;
    groups: Groups[];
    classrooms: Classrooms;
    plan_rows: (PlanRows & { seats: PlanSeats[] })[];
    students: (Students & { user: Users })[];
    courses: Courses;
  }>(
    (acc, row) => {
      if (Object.keys(acc.seances).length === 0) {
        acc.seances = row.seances;
      }

      if (Object.keys(acc.classrooms).length === 0) {
        acc.classrooms = row.classrooms;
      }
      if (Object.keys(acc.courses).length === 0) {
        acc.courses = row.courses;
      }

      if (!acc.groups.some((group) => group.id === row.groups.id)) {
        acc.groups.push(row.groups);
      }

      if (row.plan_rows) {
        if (!acc.plan_rows.some((planRow) => planRow.id === row.plan_rows.id)) {
          acc.plan_rows.push({
            ...row.plan_rows,
            seats: rowSeatsMap.get(row.plan_rows.id) || [],
          });
        }
      }

      if (!acc.students.some((student) => student.id === row.students.id)) {
        acc.students.push({
          ...row.students,
          user: row.users, // Include user data within the student object
        });
      }

      return acc;
    },
    {
      seances: {} as Seance,
      groups: [] as Groups[],
      classrooms: {} as Classrooms,
      plan_rows: [] as (PlanRows & { seats: PlanSeats[] })[],
      students: [] as (Students & { user: Users })[],
      courses: {} as Courses,
    }
  );

  // console.log(JSON.stringify(result, null, 2));
  return result;
}

export async function getStudentSeating(id: string) {
  const prepared = db
    .select()
    .from(studentSeatings)
    .where(eq(studentSeatings.seanceId, sql.placeholder("seanceId")))
    .prepare("get-student-seating");

  const query = await prepared.execute({
    seanceId: id,
  });

  return query;
}

export async function getStudentPresence(id: string) {
  const prepared = db
    .select({
      student_id: studentPresences.studentId,
      present: studentPresences.isPresent,
    })
    .from(studentPresences)
    .where(eq(studentPresences.seanceId, sql.placeholder("seanceId")))
    .prepare("get-student-presence");

  const query = await prepared.execute({
    seanceId: id,
  });

  return query;
}
