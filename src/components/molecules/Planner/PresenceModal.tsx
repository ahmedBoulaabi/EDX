"use client";
import { StudentWithUser } from "@/app/(room-planner)/seance/[id]/page";
import clsx from "clsx";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowDownSquare, ArrowUpSquareIcon, Check, X } from "lucide-react";
import { transition } from "d3";
import { Input } from "@/components/ui/input";
import { useAtom } from "jotai";
import { PresenceATOM, rowsDataATOM, seatingATOM } from "./state/planner-state";
import { RowsDataType } from "@/app/(room-planner)/planner/page";
import { UniqueIdentifier } from "@dnd-kit/core";
import {
  saveStudentPresence,
  saveStudentSeating,
} from "@/lib/supabase/planner/mutations";
import { toast } from "@/components/ui/use-toast";

interface PresenceProps {
  students: StudentWithUser[];
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  seance_id: string | undefined;
}

export type Presence = { student_id: string; present: boolean }[];
type SeatsArray = { seat_name: string; seat_id: UniqueIdentifier }[];
const PresenceModal = ({
  students,
  isOpen,
  setIsOpen,
  seance_id,
}: PresenceProps) => {
  const [action, setAction] = useState<1 | -1>(1);
  const [presence, setPresence] = useAtom<Presence | undefined>(PresenceATOM);
  const [studentList, setStudentList] = useState<StudentWithUser[]>();
  const [seating, setSeating] = useAtom(seatingATOM);
  const [rowsData, setRowsData] = useAtom(rowsDataATOM);
  const [seatsArray, setSeatsArray] = useState<SeatsArray>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState<number>();

  useEffect(() => {
    if (students.length > 0) {
      setStudentList(students);
    }
  }, [students]);

  useEffect(() => {
    if (Object.keys(rowsData).length > 0) {
      setSeatsArray(getSeatsArray(rowsData));
    }
  }, [rowsData]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen && presence && seance_id) {
      const savePresenceAndSeating = async () => {
        await saveStudentPresence(seance_id, presence ?? []);
        await saveStudentSeating(seance_id, seating);
      };

      savePresenceAndSeating();
    }
  }, [studentList, isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (studentList) {
        if (studentList.length > 0) {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            handlePresence(studentList.length - 1, true);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            handlePresence(studentList.length - 1, false);
          } else if (event.key === "Enter") {
            inputValue &&
              handlePresence(
                studentList.length - 1,
                true,
                inputValue?.toString()
              );
          }
        } else {
          setIsOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [studentList, inputValue]);

  const containerVariant = {
    inactive: { opacity: 0 },
    active: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        staggerDirection: -1,
        duration: 0.2,
      },
    },
    left: { opacity: 0 },
  };

  const elementVariant = {
    inactive: {
      y: -200,
      opacity: 0,
    },
    active: ({ delay }: { delay: number }) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        delay: delay * 0.1,
      },
    }),
    left: ({ direction }: { direction: number }) => ({
      y: -1 * direction * 200,
      backgroundColor:
        direction > 0 ? "rgba(37,37,37, 0.6)" : "rgba(255,0,0,0.1)",
      opacity: 0,
      transition: { duration: 0.3 },
    }),
  };

  function handlePresence(index: number, isPresent: boolean, seat?: string) {
    if (seat && studentList) {
      const seatNumber = seat.trim();
      const foundSeat = seatsArray?.find((s) => {
        const seatNumInName = s.seat_name.match(/\d+/)?.[0];
        return (
          seatNumInName &&
          parseInt(seatNumInName, 10) === parseInt(seatNumber, 10)
        );
      });

      if (!foundSeat) {
        // console.log(`Seat number ${seatNumber} not found`);
        toast({
          title: "Error!",
          description: `Seat number ${seatNumber} not found`,
        });
        return;
      }

      setSeating((prevSeating) => ({
        ...prevSeating,
        [foundSeat.seat_id]: {
          seat_id: foundSeat.seat_id,
          student: studentList[index],
        },
      }));
    }

    setAction(isPresent ? 1 : -1);

    if (studentList) {
      setPresence((curr) => {
        const updatedPresence = curr?.map((p) =>
          p.student_id === studentList[index].id
            ? { ...p, present: isPresent }
            : p
        );

        if (!curr?.some((p) => p.student_id === studentList[index].id)) {
          updatedPresence &&
            updatedPresence.push({
              student_id: studentList[index].id,
              present: isPresent,
            });
        }

        return updatedPresence;
      });
    }

    setTimeout(() => {
      setStudentList((prev) => prev?.filter((_, i) => i !== index));
    }, 50);
    if (studentList?.length === 1) {
      setStudentList(students);
      setIsOpen(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute w-full h-full flex justify-center items-center z-10"
          variants={containerVariant}
          initial="inactive"
          animate={isOpen ? "active" : "inactive"}
          exit="left"
        >
          <div
            className="w-full h-full bg-brand-gray-dark/70 backdrop-blur absolute"
            onClick={() => setIsOpen(false)}
          ></div>
          <AnimatePresence>
            {studentList &&
              studentList.map((student, index) => (
                <motion.div
                  key={student.id + index}
                  className={clsx(
                    "w-[95%] bg-brand-gray-light/60 backdrop-blur-lg h-[120px] rounded border-[1px] border-white/10 flex justify-center items-center absolute lg:w-[875px]",
                    index === studentList.length - 1 &&
                      "translate-y-4 bg-white/[0.025]"
                  )}
                  style={{
                    backgroundImage: "url('/images/bg-dots.svg')",
                    backgroundRepeat: "repeat",
                    backgroundSize: 300,
                    translateY:
                      index === studentList.length - 1
                        ? 0
                        : index === studentList.length - 2
                        ? -10
                        : -20,
                    scale:
                      index === studentList.length - 1
                        ? 1
                        : index === studentList.length - 2
                        ? 0.95
                        : 0.9,
                  }}
                  variants={elementVariant}
                  initial="inactive"
                  animate="active"
                  exit="left"
                  custom={{
                    delay: studentList.length - index,
                    direction: action,
                  }}
                >
                  <div className="flex justify-between px-8 w-full items-center">
                    <div className="flex justify-start gap-4 items-center w-full">
                      <div className="rounded-full h-[90%] w-[80px] aspect-square overflow-hidden relative">
                        <Image
                          src={student.photo ?? "/images/icons/user.png"}
                          width={250}
                          height={250}
                          alt=""
                          className={clsx(
                            "h-full w-full object-cover",
                            !student.photo && "invert-[1]"
                          )}
                        />
                      </div>
                      <div>
                        <p className="text-xs">{student.studentNumber}</p>
                        <p className="text-xl font-bold">
                          {student.user.firstName} {student.user.lastName}
                        </p>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2">
                      <div className="flex bg-white/10 border-[1px] border-white/20 rounded gap-2 min-w-[140px]">
                        <Input
                          ref={
                            index === studentList.length - 1 ? inputRef : null
                          }
                          type="number"
                          className="bg-transparent border-0"
                          placeholder="Seat Number"
                          onChange={(e) => setInputValue(+e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={() =>
                          handlePresence(
                            index,
                            true,
                            inputRef.current
                              ? inputRef.current.value
                              : undefined
                          )
                        }
                        className="gap-2"
                      >
                        <div className="flex">
                          <ArrowUpSquareIcon height={20} />
                        </div>
                        <Check />
                      </Button>
                      <Button
                        className="bg-red-400 gap-2"
                        onClick={() => handlePresence(index, false)}
                      >
                        <div className="flex">
                          <ArrowDownSquare height={20} />
                        </div>
                        <X />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PresenceModal;

function getSeatsArray(rowsData: RowsDataType) {
  const seatsArray: SeatsArray = [];

  for (const rowKey in rowsData) {
    if (rowsData.hasOwnProperty(rowKey)) {
      const row = rowsData[rowKey];
      row.cards.forEach((card) => {
        seatsArray.push({
          seat_name: card.text,
          seat_id: card.id,
        });
      });
    }
  }

  return seatsArray;
}
