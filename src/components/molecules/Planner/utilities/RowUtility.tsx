"use client";
import { Card, Row } from "@/app/(room-planner)/planner/page";
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

import { DndContext, useDroppable } from "@dnd-kit/core";
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core/dist/types";
import { Draggable } from "../Draggable";
import { generateNonBreaking } from "@/lib/utils/generate-password";
import { Input } from "@/components/ui/input";
import { useAtom } from "jotai";
import clsx from "clsx";
import { isBlockNameVisibleATOM, rowsDataATOM } from "../state/planner-state";
import SeatUtility from "./SeatUtility";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash } from "lucide-react";

interface RowUtilityProps {
  id?: UniqueIdentifier;
  editable?: boolean;
  openDrawer?: () => void;
  setSelectedSeat?: Dispatch<SetStateAction<UniqueIdentifier | undefined>>;
  setCards?: Dispatch<SetStateAction<Card[]>>;
}

const RowUtility = ({
  id = "RowUtility",
  editable = true,
  openDrawer,
  setSelectedSeat,
  setCards,
}: RowUtilityProps) => {
  const [rowsData, setRowsData] = useAtom(rowsDataATOM);
  const [isNameVisible, setIsNameVisible] = useAtom(isBlockNameVisibleATOM);
  const [items, setItems] = useState<Card[]>([]);
  const [name, setName] = useState<UniqueIdentifier>(
    rowsData[id] && rowsData[id].name != "" ? rowsData[id].name : id
  );

  useEffect(() => {
    if (rowsData && rowsData[id]) {
      setItems(rowsData[id].cards);
    }
  }, [rowsData, id]);

  const { setNodeRef } = useDroppable({
    id: id,
  });

  function handleChangeName(e: ChangeEvent<HTMLInputElement>) {
    e.target.style.width = e.target.value.length + 2 + "ch";
    setName(e.target.value);
    let newRowsData = rowsData;
    newRowsData[id].name = e.target.value;
    setRowsData && setRowsData(newRowsData);
  }

  const inputRef = useRef<HTMLInputElement>(null);

  const focus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  function handleDeleteRow() {
    let newRowsData = { ...rowsData };
    delete newRowsData[id];
    setRowsData && setRowsData(newRowsData);
    setCards && setCards((prev: Card[]) => prev.filter((c) => c.id != id));
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="RowUtility h-fit w-fit"
          style={{
            position: "relative",
          }}
          ref={setNodeRef}
        >
          <DndContext>
            <>
              <Input
                className={clsx(
                  "text-xs mb-1 bg-transparent p-1 h-fit border-2 border-dashed border-white/10 w-[100px] outline-none focus-visible:outline-none ring-0 focus-visible:ring-0 ring-transparent outline-transparent focus-visible:ring-offset-0 -translate-y-0 duration-200",
                  !isNameVisible &&
                    "opacity-0 pointer-events-none translate-y-6",
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
              <div
                className={clsx(
                  "group w-fit h-fit p-2 bg-brand-gray-light gap-2 rounded flex items-center justify-center hover:opacity-80 duration-200 hover:cursor-grab",
                  isNameVisible && "gap-8"
                )}
              >
                {/* Seats */}
                {items && items.length > 0 ? (
                  items.map((card, index) => (
                    <div
                      key={card.id}
                      className="aspect-square h-full min-h-20 border-white border-[1px] border-dashed"
                    >
                      {/* Seat Utility */}
                      {card.type === "seat" ? (
                        <SeatUtility
                          rowId={id}
                          card={card}
                          cardIndex={index}
                          cardName={card.text}
                          items={items}
                          setItems={setItems}
                          editable={editable}
                          openDrawer={openDrawer}
                          setSelectedSeat={setSelectedSeat}
                        />
                      ) : (
                        card.utility
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="aspect-square h-full min-h-20 border-white border-[1px] border-dashed"></div>
                    <div className="aspect-square h-full min-h-20 border-white border-[1px] border-dashed"></div>
                    <div className="aspect-square h-full min-h-20 border-white border-[1px] border-dashed"></div>
                  </>
                )}
              </div>
            </>
          </DndContext>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-fit">
        <ContextMenuItem
          onClick={() => handleDeleteRow()}
          className="cursor-pointer"
        >
          <div className="gap-2 flex text-red-500">
            Delete Row <Trash className="h-4 w-4" />
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default RowUtility;
