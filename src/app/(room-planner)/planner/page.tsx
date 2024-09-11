"use client";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PresetSelector } from "@/components/molecules/Planner/PresetSelector";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  ClientRect,
  DndContext,
  DragOverlay,
  Over,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { Coordinates, DragEndEvent, Translate } from "@dnd-kit/core/dist/types";
import { Canvas } from "@/components/molecules/Planner/Canvas";
import { Addable } from "@/components/molecules/Planner/Addable";
import { generateNonBreaking } from "@/lib/utils/generate-password";
import RowUtility from "@/components/molecules/Planner/utilities/RowUtility";
import SeatBlock from "@/components/molecules/Planner/building-blocks/SeatBlock";
import RowBlock from "@/components/molecules/Planner/building-blocks/RowBlock";
import { atom, useAtom } from "jotai";
import { Switch } from "@/components/ui/switch";
import {
  isBlockNameVisibleATOM,
  numberOfRowsATOM,
  numberOfSeatsATOM,
  rowsDataATOM,
} from "@/components/molecules/Planner/state/planner-state";
import RowWithSeats from "@/components/molecules/Planner/building-blocks/RowWithSeats";
import { ZoomTransform, zoomIdentity } from "d3-zoom";
import SeatUtility from "@/components/molecules/Planner/utilities/SeatUtility";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createPlan } from "@/lib/supabase/planner/mutations";
import { toast } from "@/components/ui/use-toast";

export type Card = {
  id: UniqueIdentifier;
  coordinates: Coordinates;
  text: string;
  type: string;
  block?: React.ReactNode;
  utility?: React.ReactNode;
  cards?: Card[];
};

export type Row = {
  id: UniqueIdentifier;
  name: string;
  cards: Card[];
};

export type RowsDataType = { [key: string]: Row };

const createSeatCards = (number: number) => {
  let cards = [];
  for (let i = 0; i < number; i++) {
    cards.push({
      id: "Seat-" + generateNonBreaking(5),
      coordinates: { x: 0, y: 0 },
      text: "Seat Block",
      type: "seat",
      block: <SeatUtility />,
      utility: <SeatUtility />,
    });
  }
  return cards;
};

const trayCards: Card[] = [
  {
    id: "Seat",
    coordinates: { x: 0, y: 0 },
    text: "Seat Block",
    type: "seat",
    block: <SeatBlock />,
    utility: <SeatUtility />,
  },
  {
    id: "Row",
    coordinates: { x: 0, y: 0 },
    text: "Row Block",
    type: "row",
    block: <RowBlock />,
    utility: <RowUtility />,
  },
  {
    id: "Row-2",
    coordinates: { x: 0, y: 0 },
    text: "Row Block",
    type: "row",
    cards: createSeatCards(2),
    block: <RowWithSeats numberOfSeats={2} />,
    utility: <RowUtility />,
  },
  {
    id: "Row-4",
    coordinates: { x: 0, y: 0 },
    text: "Row Block",
    type: "row",
    cards: createSeatCards(4),
    block: <RowWithSeats numberOfSeats={4} />,
    utility: <RowUtility />,
  },
  {
    id: "Row-6",
    coordinates: { x: 0, y: 0 },
    text: "Row Block",
    type: "row",
    cards: createSeatCards(6),
    block: <RowWithSeats numberOfSeats={6} />,
    utility: <RowUtility />,
  },
  {
    id: "Row-8",
    coordinates: { x: 0, y: 0 },
    text: "Row Block",
    type: "row",
    cards: createSeatCards(8),
    block: <RowWithSeats numberOfSeats={8} />,
    utility: <RowUtility />,
  },
];

const calculateCanvasPosition = (
  initialRect: ClientRect,
  over: Over,
  delta: Translate,
  transform: ZoomTransform
): Coordinates => ({
  x:
    (initialRect.left + delta.x - (over?.rect?.left ?? 0) - transform.x) /
    transform.k,
  y:
    (initialRect.top + delta.y - (over?.rect?.top ?? 0) - transform.y) /
    transform.k,
});

export default function Planner() {
  const [numberOfRows, setNumberOfRows] = useAtom(numberOfRowsATOM);
  const [numberOfSeats, setNumberOfSeats] = useAtom(numberOfSeatsATOM);
  const [isBlockNameVisible, setIsBlockNameVisible] = useAtom(
    isBlockNameVisibleATOM
  );

  const [planName, setPlanName] = useState<string>();

  const [cards, setCards] = useState<Card[]>([]);
  // const [rowsData, setRowsData] = useState<{ [key: string]: Row }>({});
  const [rowsData, setRowsData] = useAtom(rowsDataATOM); // Using atoms makes it easier to access this state without going through pass props hell

  const [draggedTrayCardId, setDraggedTrayCardId] =
    useState<UniqueIdentifier | null>(null);

  const [draggedTrayCardRender, setDraggedTrayCardRender] =
    useState<React.ReactNode>(null);

  const [transform, setTransform] = useState(zoomIdentity);

  const addDraggedTrayCardToCanvas = ({
    over,
    active,
    delta,
  }: DragEndEvent) => {
    setDraggedTrayCardId(null);
    // console.log(rowsData);
    //console.log(cards);

    if (over?.id !== "canvas") return;
    if (!active.rect.current.initial) return;

    const uid = generateNonBreaking(5);
    const activeID = active.id + "-" + uid;

    if (active.data.current?.type === "row") {
      setNumberOfRows((v) => v++);
      setRowsData({
        ...rowsData,
        [activeID]: {
          id: activeID,
          name: "",
          cards: active.data.current.cards
            ? createSeatCards(active.data.current.cards.length) // This is to rename the id for the cards if we're using the row blocks that include a set of cards
            : [],
        },
      });
      setCards([
        ...cards,
        {
          id: activeID,
          coordinates: calculateCanvasPosition(
            active.rect.current.initial,
            over,
            delta,
            transform
          ),
          text: active.id.toString(),
          type: active.data.current?.type,
          block: active.data.current?.block,
          utility: active.data.current?.utility,
        },
      ]);
    } else {
      setCards([
        ...cards,
        {
          id: activeID,
          coordinates: calculateCanvasPosition(
            active.rect.current.initial,
            over,
            delta,
            transform
          ),
          text: active.id.toString(),
          type: active.data.current?.type,
          block: active.data.current?.block,
          utility: active.data.current?.utility,
        },
      ]);
    }
  };

  // Automatically rename seats
  function renameSeats(
    data: typeof rowsData,
    startingName: string | null | undefined
  ) {
    if (!startingName) {
      console.error(
        "Starting name must not be null or undefined and must contain characters."
      );
      return;
    }

    let currentNumber = parseInt(startingName.match(/\d+$/)?.[0] ?? "0", 10);
    if (isNaN(currentNumber)) {
      console.error("Starting name must contain a number.");
      return;
    }

    const prefix = startingName.replace(/\d+$/, "");
    const numberLength = startingName.match(/\d+$/)?.[0]?.length;

    if (!numberLength) {
      console.error("Invalid starting name format.");
      return;
    }

    Object.values(data).forEach((row) => {
      row.cards.forEach((card) => {
        const formattedNumber = String(currentNumber).padStart(
          numberLength,
          "0"
        );
        card.text = `${prefix}${formattedNumber}`;
        currentNumber++;
      });
    });

    setRowsData(data);
  }

  function handleAddSeats() {
    const plan = generateSeatingArrangement(numberOfRows, numberOfSeats);
    setCards(plan.cards);
    setRowsData(plan.rowsData);
  }

  async function handleCreatePlan() {
    if (!planName || planName?.trim() == "") {
      toast({
        title: "Error!",
        description: "You havn't set a plan name!",
      });
    } else {
      let Ncards = JSON.parse(JSON.stringify(cards));
      let RData = JSON.parse(JSON.stringify(rowsData));
      let plan = await createPlan(planName, Ncards, RData);

      toast({
        title: "Success, Plan created!",
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(plan, null, 2)}</code>
          </pre>
        ),
      });
    }
  }

  const router = useRouter();

  return (
    <div className="h-screen bg-brand-gray-dark ">
      <div className="pt-28">
        <Separator />
      </div>
      <div className="hidden h-full flex-col md:flex bg-brand-gray-dark ">
        <div className="px-[2.5%] flex flex-col items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
          <h2 className="text-lg font-semibold">Planner</h2>
          <div className="ml-auto flex w-full space-x-2 sm:justify-end ">
            <PresetSelector />
          </div>
        </div>
        <Separator />
        <div className="px-[2.5%] h-full py-6">
          <DndContext>
            <DndContext
              onDragStart={({ active }) => {
                // console.log(active);
                setDraggedTrayCardId(active.id);
                setDraggedTrayCardRender(active.data.current?.block);
              }}
              onDragEnd={addDraggedTrayCardToCanvas}
            >
              <div className="grid h-full items-stretch gap-6 md:grid-cols-[1fr_200px] ">
                {/* Parameters */}
                <div className="hidden flex-col space-y-4 sm:flex md:order-2 ">
                  <p>Parameters</p>
                  {/* Name of plan */}
                  <div className="space-y-2">
                    <Label htmlFor="number_of_rows" className="text-xs">
                      Plan&apos;s Name
                    </Label>
                    <Input
                      placeholder="R-TP-100"
                      id="plan_name"
                      name="plan_name"
                      type="name"
                      className="bg-brand-gray-light"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="number_of_rows" className="text-xs">
                          Rows
                        </Label>
                        {/* Number of rows */}
                        <Input
                          placeholder="32"
                          id="number_of_rows"
                          name="number_of_rows"
                          type="number"
                          className="bg-brand-gray-light col-span-1"
                          onChange={(e) => setNumberOfRows(+e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="number_of_seats" className="text-xs">
                          Seats
                        </Label>
                        {/* Number of seats */}
                        <Input
                          placeholder="64"
                          id="number_of_seats"
                          name="number_of_seats"
                          type="number"
                          className="bg-brand-gray-light col-span-1"
                          onChange={(e) => setNumberOfSeats(+e.target.value)}
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full mt-2"
                      variant={"secondary"}
                      onClick={() => handleAddSeats()}
                    >
                      Add Seats
                    </Button>
                  </div>
                  {/* Seat Automatic Naming */}
                  <div className="space-y-2">
                    <Label htmlFor="number_of_rows" className="text-xs">
                      Auto seat names
                    </Label>
                    <Input
                      placeholder="ex: FST-01"
                      id="number_of_rows"
                      name="number_of_rows"
                      type="text"
                      className="bg-brand-gray-light"
                      onChange={(e) => {
                        renameSeats(rowsData, e.target.value);

                        router.refresh();
                      }}
                    />
                  </div>
                  {/* Are block names visible ? */}
                  <div className="flex space-x-3 items-center h-fit">
                    <Label htmlFor="is_block_name_visible" className="text-xs">
                      Show Names
                    </Label>
                    <Switch
                      id="is_block_name_visible"
                      name="is_block_name_visible"
                      checked={isBlockNameVisible}
                      onCheckedChange={(v) => setIsBlockNameVisible(v)}
                    />
                  </div>
                  {/* Create Room Plan */}
                  <Button onClick={() => handleCreatePlan()}>
                    Create Plan
                  </Button>
                  {/* Blocks */}
                  <p className="pt-3">Blocks</p>
                  <div className="grid grid-cols-2 gap-4 tray">
                    {trayCards.map((trayCard) => {
                      return <Addable card={trayCard} key={trayCard.id} />;
                    })}
                  </div>
                </div>
                {/* Plan viewer */}
                <div className="md:order-1 ">
                  <div className="w-full h-full max-h-[800px] max-w-full border-2 border-brand-gray-light rounded-lg overflow-hidden">
                    {/* Background */}
                    <div
                    // className="absolute w-full h-full min-h-screen left-3 top-3 bottom-3 right-3"
                    // style={{
                    //   backgroundImage: "url('/images/bg-dots.svg')",
                    //   backgroundRepeat: "repeat",
                    // }}
                    >
                      <Canvas
                        cards={cards}
                        setCards={setCards}
                        rowsData={rowsData}
                        setRowsData={setRowsData}
                        transform={transform}
                        setTransform={setTransform}
                      />
                      <DragOverlay>
                        <div className="trayOverlayCard">
                          {draggedTrayCardRender}
                        </div>
                      </DragOverlay>
                    </div>
                  </div>
                </div>
              </div>
            </DndContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

function generateSeatingArrangement(
  numberOfRows: number,
  totalSeats: number
): { cards: Card[]; rowsData: RowsDataType } {
  // Calculate seats per row evenly
  const seatsPerRow = Math.floor(totalSeats / numberOfRows);
  const additionalSeats = totalSeats % numberOfRows;

  // Initial coordinates for positioning
  let xCoord = 50;
  let yCoord = 50;
  const ySpacing = 200;

  let cards: Card[] = [];
  let rowsData: RowsDataType = {};

  for (let i = 0; i < numberOfRows; i++) {
    const rowId = `Row-${i + 1}`;
    const seatsInThisRow = seatsPerRow + (i < additionalSeats ? 1 : 0);
    let rowSeats: Card[] = [];
    // Generate cards for the seats in this row
    for (let j = 0; j < seatsInThisRow; j++) {
      const seatId = `Seat-${i}-${j}`;
      const seatCard: Card = {
        id: seatId,
        coordinates: { x: xCoord, y: yCoord },
        text: "Seat Block",
        type: "seat",
        block: <SeatBlock />,
        utility: <SeatUtility />,
      };
      rowSeats.push(seatCard);
    }

    rowsData = {
      ...rowsData,
      [rowId]: {
        id: rowId,
        name: "",
        cards: rowSeats,
      },
    };

    // Create row data
    const rowCard: Card = {
      id: rowId,
      coordinates: { x: xCoord, y: yCoord },
      text: rowId,
      type: "row",
      block: <RowBlock />,
      utility: <RowUtility />,
    };
    cards.push(rowCard);

    // Update the y-coordinate to position the next row
    yCoord += ySpacing;
  }

  return { cards, rowsData };
}
