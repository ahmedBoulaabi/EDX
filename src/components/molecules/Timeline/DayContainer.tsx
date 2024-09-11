import React from "react";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import SortableItem from "@/components/molecules/Timeline/SortableItem";
import clsx from "clsx";
import { Course } from "@/app/timeline/page";

interface DayContainerProps {
  id: UniqueIdentifier;
  courses: Course[];
  dayName: string;
  hoursAxis: string[];
}

export default function DayContainer({
  dayName,
  id,
  courses,
  hoursAxis,
}: DayContainerProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  const items = courses.map((c) => c.id);

  // const courses = (schedule ?? []).filter(
  //   (course) =>
  //     course.start
  //       ?.toLocaleDateString("en-fr", { weekday: "long" })
  //       .toLowerCase() == dayName.toLowerCase()
  // );

  return (
    <div className="h-full relative max-h-[700px]">
      <SortableContext
        id={id.toString()}
        items={items}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={clsx(
            "grid border-r-[1px] p-1 relative border-neutral-800 col-span-1 h-full bg-brand-gray-light/20"
          )}
          style={{
            gridTemplateRows: `repeat(${hoursAxis.length}, minmax(0, 1fr))`,
          }}
        >
          {/* Day Name */}
          <div className="absolute text-xs opacity-20 capitalize bottom-2 left-0 w-full text-center">
            {dayName}
          </div>
          {courses.map((course, index) => (
            <SortableItem
              key={index}
              id={course.id}
              course={course}
              hoursAxis={hoursAxis}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
