"use client";
import { MonthSelector } from "@/components/molecules/Timeline/MonthSelector";
import TimeTable from "@/components/molecules/Timeline/TimeTable";
import {
  EditingATOM,
  ScheduleATOM,
} from "@/components/molecules/Timeline/state/timeline-state";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { CourseType } from "@/lib/supabase/schema";
import { getScheduleForTeacher } from "@/lib/supabase/timeline/queries";
import { generateNonBreaking } from "@/lib/utils/generate-password";
import clsx from "clsx";
import { useAtom } from "jotai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrentSession } from "@/lib/utils/get-current-session-server";
import { Button } from "@/components/ui/button";
import { saveScheduleForTeacher } from "@/lib/supabase/timeline/mutations";
import { toast } from "@/components/ui/use-toast";
import AddSeanceModal from "@/components/molecules/Timeline/AddSeanceModal";

export type Course = {
  id: string;
  name: string | null;
  start: Date;
  end: Date;
  year: number;
  month: number;
  day: number;
  room: string | null;
  classroomId?: string;
  courseId?: string;
  type: (typeof CourseType)[keyof typeof CourseType] | null;
};

export type Schedule = { [key: string]: Course[] };

const hoursAxis = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

const Timeline = ({
  searchParams,
}: {
  searchParams: { day: string; month: string; year: string };
}) => {
  const [editing, setEditing] = useAtom(EditingATOM);
  const [schedule, setSchedule] = useAtom(ScheduleATOM);
  const [instructorId, setInstructorId] = useState<string>();
  const [daysInterval, setDaysInterval] = useState({
    start: 0,
    end: 0,
    month: 0,
    year: 0,
  });

  const router = useRouter();
  useEffect(() => {
    // RESETING GLOBAL CONTEXT STORE VARIABLES
    setSchedule({});
  }, []);

  useEffect(() => {
    async function getSchedule() {
      let currentDay = new Date();
      let day = currentDay.getUTCDate();
      let month = currentDay.getUTCMonth() + 1;
      let year = currentDay.getUTCFullYear();

      const paramDay = searchParams.day ?? undefined;
      const paramMonth = searchParams.month ?? undefined;
      const paramYear = searchParams.year ?? undefined;

      if (
        searchParams.day &&
        parseInt(paramDay.toString()) > 0 &&
        parseInt(paramDay.toString()) <= 31
      ) {
        day = parseInt(paramDay.toString()) + 2;
      }
      if (
        searchParams.month != undefined &&
        parseInt(paramMonth.toString()) > 0 &&
        parseInt(paramMonth.toString()) <= 12
      ) {
        month = parseInt(paramMonth.toString());
      }
      if (
        searchParams.year != undefined &&
        parseInt(paramYear.toString()) > 1975 &&
        parseInt(paramYear.toString()) <= 9999
      ) {
        year = parseInt(paramYear.toString());
      }

      let date = new Date(`${year}-${month}-${day}`);
      let dayOfTheWeek = date.getUTCDay() - 1;

      let startDate = new Date(date);
      startDate.setDate(date.getUTCDate() - ((dayOfTheWeek + 6) % 7));
      console.log(dayOfTheWeek);
      let endDate = new Date(startDate);
      endDate.setDate(startDate.getUTCDate() + 6);

      let startDay = startDate.getUTCDate();
      let startMonth = startDate.getUTCMonth() + 1;
      let startYear = startDate.getUTCFullYear();
      let endDay = endDate.getUTCDate();

      setDaysInterval({
        start: startDay,
        end: endDay,
        month: startMonth,
        year: startYear,
      });

      const instructor_id = (await getCurrentSession()).data.user?.id;
      setInstructorId(instructor_id);
      if (instructor_id) {
        setSchedule(
          fillPlaceholders(
            await getScheduleForTeacher(
              instructor_id,
              startDay,
              endDay,
              startMonth,
              startYear
            ),
            hoursAxis
          )
        );
      }
    }

    if (!schedule || Object.keys(schedule).length < 1) {
      getSchedule();
    }
    router.refresh();
  }, [schedule]);

  async function fetchSchedule() {
    instructorId &&
      setSchedule(
        fillPlaceholders(
          await getScheduleForTeacher(
            instructorId,
            daysInterval.start,
            daysInterval.end,
            daysInterval.month,
            daysInterval.year
          ),
          hoursAxis
        )
      );
  }

  async function handleChangeDaysInterval(direction: number) {
    const { start, month, year } = daysInterval;
    let newStartDate = new Date(year, month - 1, start);

    newStartDate.setDate(newStartDate.getDate() + direction * 7);

    while (newStartDate.getDay() !== 1) {
      newStartDate.setDate(newStartDate.getDate() - 1);
    }

    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newStartDate.getDate() + 6);
    const newEndDay = newEndDate.getUTCDate();

    const newDay = newStartDate.getDate();
    const newMonth = newStartDate.getMonth() + 1;
    const newYear = newStartDate.getFullYear();

    setDaysInterval({
      start: newDay,
      end: newEndDay,
      month: newMonth,
      year: newYear,
    });
    router.push(`/timeline?day=${newDay}&month=${newMonth}&year=${newYear}`);

    instructorId &&
      setSchedule(
        fillPlaceholders(
          await getScheduleForTeacher(
            instructorId,
            newDay,
            newEndDay,
            newMonth,
            newYear
          ),
          hoursAxis
        )
      );
  }

  const handleSaveSchedule = async () => {
    toast({
      title: "Saving schedule....",
      description: "Awaiting....",
    });
    instructorId &&
      (await saveScheduleForTeacher(
        schedule,
        instructorId,
        daysInterval.start,
        daysInterval.end,
        daysInterval.month,
        daysInterval.year
      ));

    toast({
      title: "Success!",
      description: "Schedule Saved!",
    });
  };

  return (
    <div className="h-screen bg-brand-gray-dark ">
      <div className="pt-28">
        <Separator />
      </div>
      <div className="hidden h-full flex-col md:flex bg-brand-gray-dark ">
        {/* HEADER */}
        <div className="px-[2.5%] flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold w-full">Your timeline</h2>
          <div className="ml-auto flex w-full space-x-8 sm:justify-end items-center ">
            {/* Week selector */}
            <div className="flex items-center gap-7">
              <ChevronLeft
                className="bg-brand-gray-light p-1 rounded border-[1px] border-white/10 cursor-pointer hover:opacity-50 duration-200"
                onClick={() => handleChangeDaysInterval(-1)}
              />
              <p className="text-sm text-nowrap">
                Days {daysInterval.start} to {daysInterval.end}
              </p>
              <ChevronRight
                className="bg-brand-gray-light p-1 rounded border-[1px] border-white/10 cursor-pointer hover:opacity-50 duration-200"
                onClick={() => handleChangeDaysInterval(1)}
              />
            </div>
            {/* Month Selector */}
            <MonthSelector
              daysInterval={daysInterval}
              setDaysInterval={setDaysInterval}
              revalidate={async (month: number) => {
                instructorId &&
                  setSchedule(
                    fillPlaceholders(
                      await getScheduleForTeacher(
                        instructorId,
                        1,
                        6,
                        month,
                        daysInterval.year
                      ),
                      hoursAxis
                    )
                  );
              }}
            />
            {/* Switch for edit mode */}
            <div className="flex space-x-3 items-center h-fit">
              <Label htmlFor="editing" className="text-sm">
                Edit Mode
              </Label>
              <Switch
                id="editing"
                name="editing"
                checked={editing}
                onCheckedChange={(v) => setEditing(v)}
              />
              <AddSeanceModal fetchSchedule={fetchSchedule} />
              <Button disabled={!editing} onClick={handleSaveSchedule}>
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
        <Separator />
        <div className="px-[2.5%] h-full py-6">
          <div className="grid h-full items-stretch gap-6 grid-cols-6 ">
            {/* TIMELINE VIEWER */}
            <div className={clsx("duration-200 max-h-[700px] flex col-span-6")}>
              <div
                className={clsx(
                  "h-full w-fit mr-4 text-xs grid opacity-20",
                  `grid-rows-[${hoursAxis.length}]`
                )}
              >
                {hoursAxis.map((h) => (
                  <p className="row-span-1" key={h}>
                    {h}
                  </p>
                ))}
              </div>
              <div className="w-full h-full max-w-full border-2 border-brand-gray-light rounded-lg overflow-hidden">
                {schedule && (
                  <TimeTable
                    schedule={schedule}
                    setSchedule={setSchedule}
                    hoursAxis={hoursAxis}
                    start_date={daysInterval.start}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;

function fillPlaceholders(schedule: Schedule, hoursAxis: string[]): Schedule {
  const filledSchedule: Schedule = {};

  for (const day of Object.keys(schedule)) {
    const courses = schedule[day];
    const filledCourses: Course[] = [];
    let axisIndex = 0;

    for (const course of courses) {
      const courseStart = course.start;
      const courseEnd = course.end;

      // Add placeholders up to the start of the current course
      while (axisIndex < hoursAxis.length) {
        const [axisHour, axisMinute] = hoursAxis[axisIndex]
          .split(":")
          .map(Number);
        const currentAxisTime = new Date(courseStart);
        currentAxisTime.setHours(axisHour, axisMinute, 0, 0);

        if (currentAxisTime >= courseStart) {
          break;
        }

        filledCourses.push({
          id: generateNonBreaking(6),
          name: null,
          start: currentAxisTime,
          end: new Date(currentAxisTime.getTime() + 30 * 60000), // 30 minutes later
          day: course.day,
          month: course.month,
          year: course.year,
          room: null,
          type: "PLACEHOLDER",
        });

        axisIndex++;
      }

      filledCourses.push(course);

      // Move axis index past the end of the current course
      while (axisIndex < hoursAxis.length) {
        const [axisHour, axisMinute] = hoursAxis[axisIndex]
          .split(":")
          .map(Number);
        const currentAxisTime = new Date(courseEnd);
        currentAxisTime.setHours(axisHour, axisMinute, 0, 0);

        if (currentAxisTime > courseEnd) {
          break;
        }

        axisIndex++;
      }
      axisIndex--;
    }

    // Add placeholders after the last course
    while (axisIndex < hoursAxis.length) {
      const [axisHour, axisMinute] = hoursAxis[axisIndex]
        .split(":")
        .map(Number);
      const currentAxisTime = new Date();
      currentAxisTime.setHours(axisHour, axisMinute, 0, 0);

      filledCourses.push({
        id: generateNonBreaking(6),
        name: null,
        start: currentAxisTime,
        end: new Date(currentAxisTime.getTime() + 30 * 60000), // 30 minutes later
        day: new Date(currentAxisTime).getDate(),
        month: new Date(currentAxisTime).getMonth() + 1,
        year: new Date(currentAxisTime).getFullYear(),
        room: null,
        type: "PLACEHOLDER",
      });

      axisIndex++;
    }

    filledSchedule[day] = filledCourses;
  }

  return filledSchedule;
}
