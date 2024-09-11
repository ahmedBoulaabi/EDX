"use server";
import { eq, and, between, sql } from "drizzle-orm";
import db from "../db";
import { Schedule } from "@/app/timeline/page";
import { seances, courses, seanceGroups } from "../schema";

export async function saveScheduleForTeacher(
  schedule: Schedule,
  instructor_id: string,
  start_day: number,
  end_day: number,
  month: number,
  year: number
): Promise<void> {
  "use server";

  // Filter out "PLACEHOLDER" objects from the schedule
  const filteredSchedule: Schedule = {};
  Object.keys(schedule).forEach((day) => {
    filteredSchedule[day] = schedule[day].filter(
      (seance) => seance.type !== "PLACEHOLDER"
    );
  });

  // Flatten the filtered schedule into an array of seances
  const seancesToSave = Object.values(filteredSchedule).flat();

  // Retrieve the existing seances for the instructor within the specified date range
  const existingSeances = await db
    .select({
      id: seances.id,
      courseId: seances.courseId,
      classroomId: seances.classroomId,
      startTime: seances.startTime,
      endTime: seances.endTime,
      year: seances.year,
      month: seances.month,
      day: seances.day,
    })
    .from(seances)
    .innerJoin(courses, eq(seances.courseId, courses.id))
    .where(and(eq(courses.instructor, instructor_id), eq(seances.year, year)))
    .execute();

  const seanceIdsToDelete = existingSeances.map((seance) => seance.id);
  const seancesToUpdate = [];
  const seancesToInsert = [];

  // Separate seances to update and insert
  for (const seance of seancesToSave) {
    const existingSeance = existingSeances.find(
      (existing) => existing.id === seance.id
    );

    if (existingSeance) {
      seancesToUpdate.push({
        ...seance,
        id: existingSeance.id,
      });
      // Remove the existing seance from the list to be deleted
      const index = seanceIdsToDelete.indexOf(existingSeance.id);
      if (index !== -1) {
        seanceIdsToDelete.splice(index, 1);
      }
    } else {
      seancesToInsert.push(seance);
    }
  }
  console.log("filteredSchedule", filteredSchedule);
  console.log("existingSeances", existingSeances);
  console.log("seancesToUpdate", seancesToUpdate);
  console.log("seancesToInsert", seancesToInsert);

  // Update the existing seances
  for (const seance of seancesToUpdate) {
    await db
      .update(seances)
      .set({
        courseId: seance.courseId,
        classroomId: seance.classroomId,
        startTime: new Date(seance.start),
        endTime: new Date(seance.end),
        year: seance.year,
        month: seance.month,
        day: seance.day,
      })
      .where(eq(seances.id, seance.id))
      .execute();
  }

  // Insert the new seances into the database
  for (const seance of seancesToInsert) {
    seance.courseId &&
      seance.classroomId &&
      (await db
        .insert(seances)
        .values({
          courseId: seance.courseId,
          classroomId: seance.classroomId,
          startTime: new Date(seance.start),
          endTime: new Date(seance.end),
          year: seance.year,
          month: seance.month,
          day: seance.day,
        })
        .execute());
  }
}

export async function addSeance(
  classroomId: string,
  courseId: string,
  startTime: Date,
  endTime: Date,
  day: number,
  month: number,
  year: number,
  groups: string[]
) {
  // Add seance
  const seance = await db
    .insert(seances)
    .values({
      classroomId: classroomId,
      courseId: courseId,
      startTime: startTime,
      endTime: endTime,
      month: month,
      day: day,
      year: year,
    })
    .returning()
    .execute();

  // assign groups
  groups.map(async (group) => {
    await db
      .insert(seanceGroups)
      .values({
        seanceId: seance[0].id,
        groupsId: group,
      })
      .execute();
  });

  return { error: null, success: true };
}
