"use server";
import { and, eq, sql } from "drizzle-orm";
import db from "../db";
import { revalidatePath } from "next/cache";
import { Card, Row, RowsDataType } from "@/app/(room-planner)/planner/page";
import {
  planRows,
  planSeats,
  roomPlans,
  studentPresences,
  studentSeatings,
} from "../schema";
import { Seating } from "@/app/(room-planner)/seance/[id]/page";
import { Presence } from "@/components/molecules/Planner/PresenceModal";

export async function createPlan(
  plan_name: string,
  cards: Card[],
  rowsData: RowsDataType
) {
  "use server";

  function countSeatsInRowsData(rowsData: RowsDataType): number {
    let totalSeats = 0;
    for (let key in rowsData) {
      if (rowsData.hasOwnProperty(key)) {
        totalSeats += rowsData[key].cards.length;
      }
    }
    return totalSeats;
  }

  const cleanCards = cards.filter((c) => c.type == "row");

  //   Mutation Prep
  const prepRoomPlans = db
    .insert(roomPlans)
    .values({
      name: sql.placeholder("plan_name"),
      numberOfRows: sql.placeholder("number_of_rows"),
      numberOfSeats: sql.placeholder("number_of_seats"),
    })
    .returning()
    .prepare("create-room-plan");

  const prepPlanRows = db
    .insert(planRows)
    .values({
      name: sql.placeholder("row_name"),
      planId: sql.placeholder("plan_id"),
      x: sql.placeholder("x"),
      y: sql.placeholder("y"),
    })
    .returning()
    .prepare("add-plan-row");

  const prepSeats = db
    .insert(planSeats)
    .values({
      rowId: sql.placeholder("row_id"),
      seatName: sql.placeholder("seat_name"),
    })
    .returning()
    .prepare("add-plan-seat");

  // Execution

  const roomPlan = await prepRoomPlans.execute({
    plan_name: plan_name,
    number_of_rows: cleanCards.length,
    number_of_seats: countSeatsInRowsData(rowsData),
  });

  for (let key in rowsData) {
    if (rowsData.hasOwnProperty(key)) {
      let R = rowsData[key];
      let RCard = cards.find((c) => c.id == R.id);
      let row = await prepPlanRows.execute({
        row_name: R.name.trim() != "" ? R.name : R.id,
        plan_id: roomPlan[0].id,
        x: RCard?.coordinates.x,
        y: RCard?.coordinates.y,
      });

      R.cards.map(async (card) => {
        await prepSeats.execute({ row_id: row[0].id, seat_name: card.text });
      });
    }
  }

  return roomPlan;
}

export async function saveStudentSeating(seance_id: string, seating: Seating) {
  const deleteSeating = db
    .delete(studentSeatings)
    .where(eq(studentSeatings.seanceId, sql.placeholder("seanceId")))
    .prepare("delete-student-seating");

  const insertSeating = db
    .insert(studentSeatings)
    .values({
      seanceId: sql.placeholder("seanceId"),
      seatId: sql.placeholder("seatId"),
      studentId: sql.placeholder("studentId"),
    })
    .prepare("insert-student-seating");

  await deleteSeating.execute({ seanceId: seance_id });

  for (const seatId in seating) {
    if (seating.hasOwnProperty(seatId)) {
      const seatInfo = seating[seatId];

      await insertSeating.execute({
        seanceId: seance_id,
        seatId: seatInfo.seat_id,
        studentId: seatInfo.student.id,
      });
    }
  }

  return { success: true };
}

export async function saveStudentPresence(
  seance_id: string,
  presence: Presence
) {
  const deletePresence = db
    .delete(studentPresences)
    .where(eq(studentPresences.seanceId, sql.placeholder("seanceId")))
    .prepare("delete-student-presence");

  const insertPresence = db
    .insert(studentPresences)
    .values({
      seanceId: sql.placeholder("seanceId"),
      studentId: sql.placeholder("studentId"),
      isPresent: sql.placeholder("isPresent"),
    })
    .prepare("insert-student-seating");

  await deletePresence.execute({ seanceId: seance_id });

  presence.map(async (item) => {
    await insertPresence.execute({
      seanceId: seance_id,
      studentId: item.student_id,
      isPresent: item.present,
    });
  });

  return { success: true };
}
