import React, { Dispatch, useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import DayContainer from "./DayContainer";
import { Item } from "./SortableItem";
import { Course, Schedule } from "@/app/timeline/page";
import { SetStateAction } from "jotai";
import { generateNonBreaking } from "@/lib/utils/generate-password";

type ITEMSTYPE = { [key: string]: UniqueIdentifier[] };

interface TimeTableProps {
  schedule: Schedule;
  setSchedule: SetAtom<[SetStateAction<Schedule>], void>;
  hoursAxis: string[];
  start_date: number;
}

export default function TimeTable({
  schedule,
  setSchedule,
  hoursAxis,
  start_date,
}: TimeTableProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="grid grid-cols-6 w-full h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {Object.keys(schedule).map((day, index) => (
          <DayContainer
            key={day + index}
            dayName={day}
            id={day}
            courses={schedule[day]}
            hoursAxis={hoursAxis}
          />
        ))}

        <DragOverlay>
          {activeId ? (
            <Item
              id={activeId}
              hoursAxis={hoursAxis}
              course={
                schedule[findContainer(activeId) ?? "Monday"].find(
                  (i) => i.id === activeId
                ) ?? schedule["Monday"][0]
              }
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  function findContainer(id: UniqueIdentifier) {
    if (id in schedule) {
      return id;
    }

    let containerId = null;

    for (const [day, courses] of Object.entries(schedule)) {
      if (courses.some((course) => course.id === id)) {
        containerId = day;
      }
    }

    return containerId;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over, delta } = event;
    const { id } = active;
    const overId = over ? over.id : null;

    if (overId == null) {
      return;
    }

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setSchedule((prev) => {
      if (!prev) return prev;
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex((c) => c.id == id);
      const overIndex = overItems.findIndex((c) => c.id == overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem =
          over &&
          overIndex === overItems.length - 1 &&
          delta.y > over.rect.top + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      const updatedCourse: Course = updateCourseHours(
        prev,
        activeContainer,
        activeIndex,
        newIndex - 1,
        overContainer,
        start_date
      );

      updatedCourse.day =
        start_date + getDayFromContainerId(overContainer.toString());

      // console.log(updatedCourse, "over");

      let scheduleWithPlaceholders = addPlaceholders(
        prev,
        activeContainer,
        updatedCourse
      );

      scheduleWithPlaceholders = removePlaceholders(
        scheduleWithPlaceholders,
        overContainer,
        updatedCourse
      );

      scheduleWithPlaceholders = recalculateContainerCourses(
        scheduleWithPlaceholders,
        activeContainer
      );

      return {
        ...scheduleWithPlaceholders,
        [activeContainer]: [
          ...scheduleWithPlaceholders[activeContainer].filter(
            (item: Course) => item.id !== active.id
          ),
        ],
        [overContainer]: [
          ...scheduleWithPlaceholders[overContainer].slice(0, newIndex),
          updatedCourse,
          ...scheduleWithPlaceholders[overContainer].slice(
            newIndex,
            scheduleWithPlaceholders[overContainer].length
          ),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const { id } = active;
    const overId = over ? over.id : null;

    if (overId == null) {
      return;
    }

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = schedule[activeContainer].findIndex(
      (c) => c.id == active.id
    );
    const overIndex = schedule[overContainer].findIndex((c) => c.id == overId);

    if (activeIndex !== overIndex) {
      const updatedCourse = updateCourseHours(
        schedule,
        overContainer,
        activeIndex,
        overIndex,
        overContainer,
        start_date
      );

      updatedCourse.day =
        start_date + getDayFromContainerId(overContainer.toString());

      // console.log(updatedCourse, "end");

      let updatedSchedule = {
        ...schedule,
        [overContainer]: arrayMove(
          schedule[overContainer],
          activeIndex,
          overIndex
        ),
      };

      updatedSchedule[overContainer][overIndex] = updatedCourse;
      updatedSchedule = recalculateContainerCourses(
        updatedSchedule,
        overContainer
      );

      setSchedule(updatedSchedule);
    }

    setActiveId(undefined);
  }

  function parseTimeString(timeString: string) {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  function updateCourseHours(
    schedule: Schedule,
    container: UniqueIdentifier,
    activeIndex: number,
    overIndex: number,
    overContainer: UniqueIdentifier,
    start_date: number
  ) {
    let tempSchedule = JSON.parse(JSON.stringify(schedule)); // Making a deep copy of the schedule
    const containerCourses = tempSchedule[container];
    const courseToMove = JSON.parse(
      JSON.stringify(containerCourses[activeIndex])
    );

    // Ensure start and end are Date objects
    courseToMove.start = new Date(courseToMove.start);
    courseToMove.end = new Date(courseToMove.end);

    // Set newStartTime to the first hour and minute from the hoursAxis
    let newStartTime = parseTimeString(hoursAxis[0]);

    // Calculate the new start time by iterating through the courses in the container
    for (let i = 0; i < overIndex; i++) {
      if (i === activeIndex) {
        continue; // Skip the course being moved
      }

      const currentCourse = JSON.parse(JSON.stringify(containerCourses[i]));
      currentCourse.start = new Date(currentCourse.start);
      currentCourse.end = new Date(currentCourse.end);

      let duration;

      if (currentCourse.type === "PLACEHOLDER") {
        duration = 30 * 60000; // 30 minutes in milliseconds
      } else {
        duration = currentCourse.end.getTime() - currentCourse.start.getTime();
      }

      newStartTime = new Date(newStartTime.getTime() + duration);
    }

    // Calculate the new end time based on the duration of the course to move
    const courseDuration =
      courseToMove.end.getTime() - courseToMove.start.getTime();
    let newEndTime = new Date(newStartTime.getTime() + courseDuration);

    // Checking if the newEndTime exceeds the last hour in the hoursAxis
    const lastHour = parseTimeString(hoursAxis[hoursAxis.length - 1]);
    if (newEndTime > lastHour) {
      newEndTime = lastHour;
      newStartTime = new Date(newEndTime.getTime() - courseDuration);
    }

    // Update the date component without changing the hour
    const originalStartDate = new Date(courseToMove.start);
    const originalEndDate = new Date(courseToMove.end);

    const newStartDate = new Date(
      originalStartDate.getFullYear(),
      originalStartDate.getMonth(),
      start_date + getDayFromContainerId(overContainer.toString())
    );
    newStartDate.setHours(
      newStartTime.getHours(),
      newStartTime.getMinutes(),
      0,
      0
    );

    const newEndDate = new Date(
      originalEndDate.getFullYear(),
      originalEndDate.getMonth(),
      start_date + getDayFromContainerId(overContainer.toString())
    );
    newEndDate.setHours(newEndTime.getHours(), newEndTime.getMinutes(), 0, 0);

    // Convert dates to ISO strings
    const newStartString = newStartDate.toISOString();
    const newEndString = newEndDate.toISOString();

    // Create a new course object with the updated data
    const updatedCourse: Course = {
      ...courseToMove,
      start: new Date(newStartString),
      end: new Date(newEndString),
      day: start_date + getDayFromContainerId(overContainer.toString()),
      month: newStartDate.getMonth() + 1,
      year: newStartDate.getFullYear(),
    };

    return updatedCourse;
  }

  function addPlaceholders(
    schedule: Schedule,
    container: UniqueIdentifier,
    course: Course
  ) {
    const updatedSchedule = schedule;

    const containerCourses = updatedSchedule[container];
    const placeholders = [];

    const courseDuration =
      (new Date(course.end).getTime() - new Date(course.start).getTime()) /
      (30 * 60000); // duration in 30-minute parts

    let currentTime = new Date(course.start);
    for (let i = 0; i < courseDuration; i++) {
      const placeholder = {
        id: generateNonBreaking(6),
        name: null,
        start: new Date(currentTime),
        end: new Date(currentTime.getTime() + 30 * 60000),
        day: course.day,
        month: course.month,
        year: course.year,
        room: null,
        type: "PLACEHOLDER",
      };
      placeholders.push(placeholder);
      currentTime = new Date(placeholder.end);
    }

    updatedSchedule[container] = [...containerCourses, ...placeholders].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return updatedSchedule;
  }

  function removePlaceholders(
    schedule: Schedule,
    container: UniqueIdentifier,
    course: Course
  ) {
    const updatedSchedule = schedule;
    const containerCourses = updatedSchedule[container];

    const updatedCourses = containerCourses.filter((c: Course) => {
      return (
        c.type !== "PLACEHOLDER" ||
        new Date(c.start) < new Date(course.start) ||
        new Date(c.end) > new Date(course.end)
      );
    });

    updatedSchedule[container] = updatedCourses;
    return updatedSchedule;
  }

  function recalculateContainerCourses(
    schedule: Schedule,
    container: UniqueIdentifier
  ) {
    const updatedSchedule = schedule; // Making a deep copy of the schedule
    const containerCourses = updatedSchedule[container];
    let currentTime = parseTimeString(hoursAxis[0]);

    for (let i = 0; i < containerCourses.length; i++) {
      const course = containerCourses[i];

      if (course.type === "PLACEHOLDER") {
        course.start = new Date(currentTime);
        course.end = new Date(currentTime.getTime() + 30 * 60000);
      } else {
        const duration =
          new Date(course.end).getTime() - new Date(course.start).getTime();
        course.start = new Date(currentTime);
        course.end = new Date(currentTime.getTime() + duration);
      }
      currentTime = new Date(course.end);
    }

    return updatedSchedule;
  }
}

// Helper function to get the day from the container id
function getDayFromContainerId(containerId: string): number {
  const dayMapping: { [key: string]: number } = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };

  return dayMapping[containerId] || 0;
}
