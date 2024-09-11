"use server";
import { and, between, eq, or, sql } from "drizzle-orm";
import db from "../db";
import { classrooms, courses, seances } from "../schema";
import { Course, Schedule } from "@/app/timeline/page";

export async function getScheduleForTeacher(
  instructor_id: string,
  start_day: number,
  end_day: number,
  month: number,
  year: number
): Promise<Schedule> {
  "use server";

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const dateCondition =
    start_day <= end_day
      ? and(
          between(
            seances.day,
            sql.placeholder("start_day"),
            sql.placeholder("end_day")
          ),
          eq(seances.month, sql.placeholder("month")),
          eq(seances.year, sql.placeholder("year"))
        )
      : or(
          and(
            between(seances.day, sql.placeholder("start_day"), 31),
            eq(seances.month, sql.placeholder("month")),
            eq(seances.year, sql.placeholder("year"))
          ),
          and(
            between(seances.day, 1, sql.placeholder("end_day")),
            eq(seances.month, sql.placeholder("next_month")),
            eq(seances.year, sql.placeholder("next_year"))
          )
        );

  const prep = db
    .select({
      id: seances.id,
      name: courses.name,
      start: seances.startTime,
      end: seances.endTime,
      day: seances.day,
      month: seances.month,
      year: seances.year,
      room: classrooms.name,
      type: courses.courseType,
      classroomId: seances.classroomId,
      courseId: seances.courseId,
    })
    .from(seances)
    .innerJoin(courses, eq(seances.courseId, courses.id))
    .innerJoin(classrooms, eq(seances.classroomId, classrooms.id))
    .where(
      and(dateCondition, eq(courses.instructor, sql.placeholder("instructor")))
    )
    .orderBy(seances.startTime)
    .prepare("get-schedule-for-teacher");

  const coursesQuery: Course[] = await prep.execute({
    start_day: start_day,
    end_day: end_day,
    instructor: instructor_id,
    month: month,
    year: year,
    next_month: nextMonth,
    next_year: nextYear,
  });

  const schedule: Schedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  };

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  coursesQuery.forEach((course) => {
    if (course.start) {
      const dayOfWeek =
        daysOfWeek[
          new Date(`${course.year}-${course.month}-${course.day}`).getDay()
        ];
      if (schedule[dayOfWeek]) {
        schedule[dayOfWeek].push(course);
      }
    }
  });

  return schedule;
}
