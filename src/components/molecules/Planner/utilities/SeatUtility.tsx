"use client";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useAtom } from "jotai";
import Image from "next/image";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  PresenceATOM,
  availableStudentsATOM,
  isBlockNameVisibleATOM,
  rowsDataATOM,
  seatingATOM,
} from "../state/planner-state";
import clsx from "clsx";
import { Input } from "@/components/ui/input";
import { Card } from "@/app/(room-planner)/planner/page";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Check, PlusSquare, Trash, UserCheck, UserX, X } from "lucide-react";
import { Seating } from "@/app/(room-planner)/seance/[id]/page";
import { Separator } from "@/components/ui/separator";
import { Presence } from "../PresenceModal";

interface SeatUtilityProps {
  rowId?: UniqueIdentifier;
  card?: Card;
  cardIndex?: number;
  cardName?: string;
  items?: Card[];
  setItems?: React.Dispatch<React.SetStateAction<Card[]>>;
  editable?: boolean;
  openDrawer?: () => void;
  setSelectedSeat?: Dispatch<SetStateAction<UniqueIdentifier | undefined>>;
}

export default function SeatUtility({
  rowId = "",
  card,
  cardIndex = 0,
  cardName = "Name",
  items,
  setItems,
  editable = true,
  openDrawer = () => {},
  setSelectedSeat,
}: SeatUtilityProps) {
  const [rowsData, setRowsData] = useAtom(rowsDataATOM);
  const [isNameVisible, setIsNameVisible] = useAtom(isBlockNameVisibleATOM);
  const [name, setName] = useState<UniqueIdentifier>(cardName);
  const [seating, setSeating] = useAtom(seatingATOM);
  const [availableStudents, setAvailableStudents] = useAtom(
    availableStudentsATOM
  );
  const [presence, setPresence] = useAtom<Presence | undefined>(PresenceATOM);

  useEffect(() => {
    setName(cardName);
  }, [cardName]);

  const inputRef = useRef<HTMLInputElement>(null);

  const focus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  function handleChangeName(e: ChangeEvent<HTMLInputElement>) {
    e.target.style.width = e.target.value.length + 2 + "ch";
    setName(e.target.value);
    let newRowsData = rowsData;
    newRowsData[rowId].cards[cardIndex].text = e.target.value;
    setRowsData && setRowsData(newRowsData);
  }
  function handleDeleteSeat() {
    let newRowsData = rowsData;
    if (!items) return;
    let newItems = items;
    newRowsData[rowId].cards = newRowsData[rowId].cards.filter(
      (c) => c != card
    );
    newItems = newItems.filter((c) => c != card);
    setRowsData && setRowsData(newRowsData);
    setItems && setItems(newItems);
  }

  const isStudentPresent = (studentId: string) => {
    return (
      presence && presence.some((p) => p.student_id === studentId && p.present)
    );
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="group select-none relative aspect-square w-full max-w-[120px] bg-brand-gray-light rounded flex items-center justify-center hover:opacity-80 duration-200 hover:cursor-grab">
          {rowId && (
            <Input
              className={clsx(
                "absolute -bottom-12 left-0 whitespace-nowrap text-xs mb-1 bg-transparent p-1 h-fit border-2 border-dashed border-white/10 w-[100px] outline-none focus-visible:outline-none ring-0 focus-visible:ring-0 ring-transparent outline-transparent focus-visible:ring-offset-0 -translate-y-0 duration-200",
                !isNameVisible && "opacity-0 pointer-events-none translate-y-6",
                !editable && "border-0"
              )}
              ref={inputRef}
              onFocus={focus}
              onPointerDown={(e) => {
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }, 200);
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }, 400);
              }}
              onChange={handleChangeName}
              value={name}
              disabled={!editable && isNameVisible}
            />
          )}
          {editable ? (
            <Image
              src="/images/icons/chair.png"
              alt="seat icon"
              className="opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none"
              width={70}
              height={70}
            />
          ) : (
            <div
              onClick={() => {
                openDrawer();
                setSelectedSeat && setSelectedSeat(card?.id);
              }}
            >
              {seating && card && seating[card.id] ? (
                <div className="relative">
                  <Image
                    src={
                      seating[card.id].student.photo ?? "/images/icons/user.png"
                    }
                    alt="seat icon"
                    className="opacity-50 group-hover:opacity-100 object-cover duration-200 select-none pointer-events-none rounded-full aspect-square"
                    width={70}
                    height={70}
                  />
                  <div className="absolute bottom-2 text-[9px] w-full text-center">
                    {seating[card.id].student.user.lastName}
                  </div>
                  {/* Presence status */}
                  {isStudentPresent(seating[card.id].student.id) ? (
                    <div className="absolute top-0 right-0">
                      <Check className="bg-emerald-500 rounded scale-75" />
                    </div>
                  ) : (
                    <div className="absolute top-0 right-0">
                      <X className="bg-red-500 rounded scale-75" />
                    </div>
                  )}
                </div>
              ) : (
                <PlusSquare
                  width={45}
                  height={45}
                  className="opacity-50 group-hover:opacity-100 duration-200 select-none pointer-events-none"
                />
              )}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-fit">
        {editable ? (
          <ContextMenuItem
            onClick={() => handleDeleteSeat()}
            className="cursor-pointer"
          >
            <div className="gap-2 flex text-red-500">
              Delete Seat <Trash className="h-4 w-4" />
            </div>
          </ContextMenuItem>
        ) : (
          <>
            <ContextMenuItem
              onClick={() => {
                openDrawer();
                setSelectedSeat && setSelectedSeat(card?.id);
              }}
              className="cursor-pointer"
            >
              <div className="gap-2 flex">
                Assign Student <UserCheck className="h-4 w-4" />
              </div>
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => {
                card &&
                  setAvailableStudents(
                    (prev) => prev && [...prev, seating[card.id].student]
                  );
                card &&
                  setSeating((prev) => {
                    const r = prev;
                    delete r[card.id];
                    return r;
                  });
              }}
              className="cursor-pointer "
            >
              <div className="gap-2 flex text-red-500">
                Unassign Student <UserX className="h-4 w-4" />
              </div>
            </ContextMenuItem>

            <Separator />
            <Separator />

            <ContextMenuItem className="cursor-pointer">
              <div className="gap-2 flex">
                Set As Present <UserCheck className="h-4 w-4" />
              </div>
            </ContextMenuItem>
            <ContextMenuItem className="cursor-pointer ">
              <div className="gap-2 flex text-red-500">
                Set as Not Present <UserX className="h-4 w-4" />
              </div>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
