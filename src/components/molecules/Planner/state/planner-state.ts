import { Row, RowsDataType } from "@/app/(room-planner)/planner/page";
import {
  Seating,
  StudentWithUser,
} from "@/app/(room-planner)/seance/[id]/page";
import { atom } from "jotai";
import { Presence } from "../PresenceModal";

// ATOM STATE MANAGEMENT VARIABLES
export const numberOfRowsATOM = atom(0);
export const numberOfSeatsATOM = atom(0);
export const isBlockNameVisibleATOM = atom(true);
export const rowsDataATOM = atom<RowsDataType>({});
export const seatingATOM = atom<Seating>({});
export const PresenceATOM = atom<Presence | undefined>(undefined);
export const availableStudentsATOM = atom<StudentWithUser[] | undefined>(
  undefined
);
