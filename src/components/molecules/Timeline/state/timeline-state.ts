import { Schedule } from "@/app/timeline/page";
import { atom } from "jotai";

// ATOM STATE MANAGEMENT VARIABLES
export const EditingATOM = atom(false);
export const ScheduleATOM = atom<Schedule>({});
