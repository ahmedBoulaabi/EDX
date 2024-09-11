import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Course } from "@/app/timeline/page";
import clsx from "clsx";
import { useAtom } from "jotai";
import { EditingATOM } from "./state/timeline-state";
import { useRouter } from "next/navigation";

interface SortableItemProps {
  id: UniqueIdentifier;
  course: Course;
  hoursAxis: string[];
}

export function Item({ id, course, hoursAxis }: SortableItemProps) {
  const [editing, setEditing] = useAtom(EditingATOM);

  let bgColor = "bg-brand-pink/80";
  switch (course.type) {
    case "CM":
      bgColor = "bg-blue-500/80";
      break;
    case "TP":
      bgColor = "bg-red-500/80";
      break;
    case "Examen_CCF":
      bgColor = "bg-brand-yellow/80";
      break;
    case "Examen_CCI":
      bgColor = "bg-brand-yellow/80";
      break;

    default:
      break;
  }

  return course.type != "PLACEHOLDER" ? (
    <div
      className={clsx(
        "flex flex-col rounded text-center text-sm p-4 justify-around border-brand-gray-dark border-[1px] w-full h-full overflow-hidden",
        bgColor
      )}
    >
      <div>
        <p>{course.name}</p>
        <p className="opacity-70">
          {(course.start ?? new Date("1999-01-01")).getHours()}:
          {String(
            (course.start ?? new Date("1999-01-01")).getMinutes()
          ).padStart(2, "0")}
          -{(course.end ?? new Date("1999-01-01")).getHours()}:
          {String((course.end ?? new Date("1999-01-01")).getMinutes()).padStart(
            2,
            "0"
          )}
        </p>
      </div>
      <p className="font-bold">{course.room}</p>
    </div>
  ) : (
    <div
      className={clsx(
        "flex flex-col rounded text-center text-sm justify-around border-brand-gray-dark border-[1px] w-full h-full overflow-hidden",
        editing && "bg-white/5 min-h-0",
        !editing && "cursor-default"
      )}
    ></div>
  );
}

export default function SortableItem({
  id,
  course,
  hoursAxis,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const [editing, setEditing] = useAtom(EditingATOM);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const router = useRouter();

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...findGridPosition(
          course.start ?? new Date("1999-01-01"),
          course.end ?? new Date("1999-01-01"),
          hoursAxis
        ),
      }}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        if (!editing && course.type != "PLACEHOLDER") {
          e.preventDefault();
          router.push("/seance/" + id);
        } else {
          listeners?.onPointerDown?.(e);
        }
      }}
    >
      <Item id={id} course={course} hoursAxis={hoursAxis} />
    </div>
  );
}

function findGridPosition(startTime: Date, endTime: Date, hoursAxis: string[]) {
  const formatAndRoundTime = (date: Date): string => {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (minutes < 15) {
      minutes = 0;
    } else if (minutes < 45) {
      minutes = 30;
    } else {
      minutes = 0;
      hours++;
    }

    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    if (hours === 24) {
      return "00:00";
    }

    return formattedTime;
  };

  const startStr = formatAndRoundTime(startTime);
  const endStr = formatAndRoundTime(endTime);

  const rowIndexStart = hoursAxis.findIndex((time) => time === startStr);
  const rowIndexEnd = hoursAxis.findIndex((time) => time === endStr);

  return {
    gridRow: `span ${rowIndexEnd - rowIndexStart} / span ${
      rowIndexEnd - rowIndexStart
    }`,
  };
}
